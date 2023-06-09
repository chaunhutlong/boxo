const httpStatus = require('http-status');
const axios = require('axios');
const { Book, Genre, Author, Publisher } = require('../models');
const ApiError = require('../utils/ApiError');
const { getSignedUrl, deleteFilesFromS3, uploadImagesBase64 } = require('../utils/s3');
const { parseBase64Image } = require('../utils/base64');
const { bucket } = require('../config/s3.enum');

/**
 * Validate book and signed url for images
 * @returns {Promise<Object>}
 * @private
 * @param book
 */
async function validateBookAndSignedUrl(book) {
  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
  }

  if (book.images && Object.keys(book.images).length > 0) {
    Object.keys(book.images).forEach((key) => {
      if (book.images[key].key) {
        book.images[key].url = getSignedUrl(bucket.IMAGES, book.images[key].key);
        book.images[key].key = undefined;
      }
    });
  }
}

async function uploadBookImages(parsedImages, bookId) {
  try {
    return await uploadImagesBase64(bucket.IMAGES, parsedImages, `book-${bookId}`);
  } catch (err) {
    throw new ApiError(err.statusCode || httpStatus.INTERNAL_SERVER_ERROR, err.message);
  }
}

/**
 * Create a book
 * @param {Object} bookBody
 * @param {string|string[]} base64ImagesString
 * @returns {Promise<Book>}
 */
const createBook = async (bookBody, base64ImagesString) => {
  if (await Book.isNameTaken(bookBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }

  const book = new Book(bookBody);

  let parsedImages = [];
  if (base64ImagesString) {
    const base64ImagesArray = Array.isArray(base64ImagesString) ? base64ImagesString : [base64ImagesString];
    parsedImages = base64ImagesArray.map(parseBase64Image);

    const uploadedImages = await uploadBookImages(parsedImages, book._id);

    book.images = uploadedImages.map(({ Key, Location }) => ({ key: Key, url: Location }));
  }

  await book.save();

  return book;
};

/**
 * Query for books
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryBooks = async (filter, options) => {
  return Book.paginate(filter, options);
};

/**
 * Get book by id
 * @param {ObjectId} id
 * @returns {Promise<Book>}
 */
const getBookById = async (id) => {
  const book = await Book.findById(id).populate('genres').populate('authors').populate('publisher');

  await validateBookAndSignedUrl(book);
  return book;
};

/**
 * Update book by id
 * @param {ObjectId} bookId
 * @param {Object} bookBody
 * @param {string|string[]} base64ImagesString
 * @returns {Promise<Book>}
 */
const updateBookById = async (bookId, bookBody, base64ImagesString) => {
  const book = await Book.findById(bookId);

  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
  }

  if (bookBody.name && (await Book.isNameTaken(bookBody.name, bookId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }

  Object.assign(book, bookBody);

  if (base64ImagesString) {
    const base64ImagesArray = Array.isArray(base64ImagesString) ? base64ImagesString : [base64ImagesString];

    // if bookImageArray has link, that not do anything
    if (base64ImagesArray[0].startsWith('http')) {
      await book.save();
      return book;
    }

    // if base64ImageString is base64 string, delete old images and upload new images

    const parsedImages = base64ImagesArray.map((base64Image) => parseBase64Image(base64Image));

    await Promise.all(Object.keys(book.images).map((key) => deleteFilesFromS3(bucket.IMAGES, book.images[key].key)));

    const uploads = await uploadBookImages(parsedImages, book._id);
    book.images = uploads.map(({ Key, Location }) => ({ key: Key, url: Location }));
  }

  return book;
};

/**
 * Delete book by id
 * @param {ObjectId} bookId
 * @returns {Promise<Book>}
 */
const deleteBookById = async (bookId) => {
  const book = await Book.findById(bookId).populate('images');

  await Promise.all(Object.keys(book.images).map((key) => deleteFilesFromS3(bucket.IMAGES, book.images[key].key)));

  await book.remove();
};

/**
 * Get book by ISBN
 * @param {string} isbn
 * @returns {Promise<Book>}
 */
const getBookByISBN = async (isbn) => {
  const book = await Book.findOne({ isbn }).populate('genres').populate('authors').populate('publisher');

  await validateBookAndSignedUrl(book);
  return book;
};

/**
 * Crawl data from google book api
 * @returns {Promise<{image: {url: *}, thumbnail: *, isbn: *, description: *, language: *, priceDiscount: null, price, name: *, totalPages: *, publisher: *, publishedDate: *, categories: *, authors: *}[]>}
 * @param {Object} body
 */
const crawlBook = async (body) => {
  try {
    const { genre, lang, keyword } = body;
    let query = keyword || '';
    if (genre) {
      query += `+subject:${genre}`;
    }

    const apiKey = process.env.GOOGLE_BOOK_API_KEY;
    const baseUrl = 'https://www.googleapis.com/books/v1/volumes';
    const maxResults = 40;

    // Make the initial API request to get the total number of items
    const initialResponse = await axios.get(`${baseUrl}?q=${query}&key=${apiKey}&printType=books&langRestrict=${lang}`);
    const { totalItems } = initialResponse.data;

    // Calculate the number of requests needed based on totalItems
    const maxIndex = Math.ceil(totalItems / maxResults);

    // Create an array of start indices
    const startIndices = Array.from({ length: maxIndex }, (_, index) => index * maxResults);

    // Execute the API requests concurrently using Promise.all and map
    const responses = await Promise.all(
      startIndices.map((startIndex) =>
        axios.get(`${baseUrl}?q=${query}&startIndex=${startIndex}&maxResults=${maxResults}&key=${apiKey}`)
      )
    );

    // Extract the items from each response
    const items = responses.flatMap((response) => response.data.items);

    // Filter books with price using filter
    const filteredItems = items.filter((item) => {
      if (!item) return false;
      const { volumeInfo } = item;
      const { industryIdentifiers } = volumeInfo;
      return industryIdentifiers && industryIdentifiers.length > 0;
    });

    // Create an array of update operations (promises)
    const updateOperations = filteredItems.map(async (item) => {
      const { volumeInfo, saleInfo } = item;

      const { title, authors, publisher, industryIdentifiers, description, pageCount, categories, imageLinks, language } =
        volumeInfo;

      let { publishedDate } = volumeInfo;
      const isbn = industryIdentifiers[0].identifier;

      if (isbn && (await Book.isISBNTaken(isbn))) {
        return;
      }

      let { listPrice, retailPrice } = saleInfo;
      listPrice = listPrice ? listPrice.amount : null;
      retailPrice = retailPrice ? retailPrice.amount : null;

      const thumbnail = imageLinks ? imageLinks.thumbnail : null;

      // find approximately genres in database with categories
      let genresArray = [];
      if (categories && categories.length > 0) {
        genresArray = await Promise.all(
          categories.map(async (category) => {
            let genreExist = await Genre.findOne({
              $text: { $search: category },
            });

            if (!genreExist) {
              // if genre not exist, find genre with similar name in book title
              genreExist = await Genre.findOne({
                $text: { $search: title },
              });
            }

            return genreExist ? genreExist._id : null;
          })
        );
      }

      // if genresArray is empty, add to other genre
      if (genresArray.length === 0) {
        const genreOther = await Genre.findOne({ name: 'Other' });
        genresArray.push(genreOther._id);
      }

      let authorsArray = [];
      if (authors && authors.length > 0) {
        authorsArray = await Promise.all(
          authors.map(async (author) => {
            const { _id: authorId } = await Author.findOneAndUpdate(
              { name: author },
              { $set: { name: author } },
              { upsert: true, new: true }
            );
            return authorId;
          })
        );
      }

      // cast publishedDate, if publishedDate is not valid, set publishedDate to null
      const publishedDateObject = new Date(publishedDate);
      const isValidPublishedDate = !Number.isNaN(publishedDateObject.getTime());
      if (!isValidPublishedDate) {
        publishedDate = null;
      }

      // create publisher if not exist
      const { _id: publisherId } = await Publisher.findOneAndUpdate(
        { name: publisher },
        { $set: { name: publisher } },
        { upsert: true, new: true }
      );

      return Book.create({
        name: title,
        authors: authorsArray,
        genres: genresArray,
        publisherId,
        publishedDate,
        description,
        availableQuantity: 1000,
        totalPages: pageCount || 0,
        thumbnail,
        language,
        images: thumbnail ? [{ url: thumbnail }] : [],
        isbn,
        price: listPrice || retailPrice || Math.floor(Math.random() * 1000 + 1) * 1000,
        priceDiscount: retailPrice,
      });
    });

    // filter null values
    return (await Promise.all(updateOperations)).filter((book) => book);
  } catch (err) {
    throw new ApiError(err.statusCode || httpStatus.INTERNAL_SERVER_ERROR, err.message);
  }
};

const getPopularBooks = async () => {
  try {
    const response = await axios.get(process.env.RECOMMEND_URL);

    if (response.status === 200) {
      const { data } = response;
      const bookIds = data.map((item) => item.bookid);

      const books = await Book.find({ _id: { $in: bookIds } })
        .populate('genres')
        .populate('authors')
        .populate('publisher')
        .exec();

      const validatedBooks = await Promise.all(
        books.map(async (book) => {
          await validateBookAndSignedUrl(book);
          return book;
        })
      );

      const popular = { datas: validatedBooks };
      return popular;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const getRecommedBookByBookId = async (id) => {
  try {
    const url = `${process.env.RECOMMEND_URL}/recommend`;
    const requestData = { bookid: id };
    const response = await axios.post(url, requestData);

    if (response.status === 200) {
      const { data } = response;
      const bookIds = data.map((item) => item.bookid);

      const books = await Book.find({ _id: { $in: bookIds } })
        .populate('genres')
        .populate('authors')
        .populate('publisher')
        .exec();

      const validatedBooks = await Promise.all(
        books.map(async (book) => {
          await validateBookAndSignedUrl(book);
          return book;
        })
      );

      const recommend = { datas: validatedBooks };
      return recommend;
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  createBook,
  queryBooks,
  getBookById,
  updateBookById,
  deleteBookById,
  getBookByISBN,
  crawlBook,
  getPopularBooks,
  getRecommedBookByBookId,
};
