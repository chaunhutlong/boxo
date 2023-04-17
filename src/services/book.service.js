const httpStatus = require('http-status');
const { Book, BookImage } = require('../models');
const ApiError = require('../utils/ApiError');
const { getSignedUrl, deleteFile, uploadImagesBase64 } = require('../utils/s3');

const { bucket } = require('../config/s3.enum');

async function deleteBookImages(bookImages) {
  if (!bookImages) return;
  const keys = bookImages.map((image) => image.key);
  try {
    await Promise.all(keys.map((key) => deleteFile(bucket.IMAGES, key)));
    await BookImage.deleteMany({ key: { $in: keys } });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting book images');
  }
}

async function uploadBookImages(base64ImagesString, bookId) {
  try {
    const base64ImagesArray = Array.isArray(base64ImagesString) ? base64ImagesString : [base64ImagesString];

    const start = performance.now();
    const bookImagesKey = await uploadImagesBase64(bucket.IMAGES, base64ImagesArray, `book-${bookId}`);
    console.log('uploadImagesBase64 take' + (performance.now() - start) + 'ms');

    const bookImageDocs = bookImagesKey.map((imageKey) => ({
      key: imageKey,
      bookId,
    }));

    const createBookImages = await BookImage.insertMany(bookImageDocs);
    return createBookImages;
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err.message);
  }
}

/**
 * Create a book
 * @param {Object} bookBody
 * @returns {Promise<Book>}
 */
const createBook = async (bookBody, base64ImagesString) => {
  let bookImages;
  try {
    if (await Book.isNameTaken(bookBody.name)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }

    const book = new Book(bookBody);

    const start = performance.now();
    if (base64ImagesString) {
      console.log('base64ImagesString', base64ImagesString);
      bookImages = await uploadBookImages(base64ImagesString, book._id);
      console.log(performance.now() - start);
      const bookImagesIds = bookImages.map((image) => image._id);

      book.images = bookImagesIds;

      book.save().catch((err) => {
        console.log(performance.now() - start);
        deleteBookImages(bookImages).finally(() => {
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error saving book: ${err}`);
        });
      });
    } else {
      await book.save();
    }

    const end = performance.now();

    console.log(`Create book took ${end - start} milliseconds.`);

    return book;
  } catch (error) {
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    if (error.statusCode) {
      statusCode = error.statusCode;
    }
    throw new ApiError(statusCode, error.message);
  }
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
  const books = await Book.paginate(filter, { ...options, populate: 'images' });

  return books;
};

/**
 * Get book by id
 * @param {ObjectId} id
 * @returns {Promise<Book>}
 */
const getBookById = async (id) => {
  const book = await Book.findById(id)
    .lean()
    .populate('genres')
    .populate('authors')
    .populate('publisher')
    .populate('images');

  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
  }

  Object.keys(book.images).forEach((key) => {
    book.images[key].url = getSignedUrl(bucket.IMAGES, book.images[key].key);
    delete book.images[key].key;
    delete book.images[key].bookId;
  });

  return book;
};

/**
 * Update book by id
 * @param {ObjectId} bookId
 * @param {Object} updateBody
 * @returns {Promise<Book>}
 */
const updateBookById = async (bookId, bookBody, base64ImageString) => {
  let bookImages;
  try {
    const book = await Book.findById(bookId).populate('images');

    if (!book) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
    }

    if (bookBody.name && (await Book.isNameTaken(bookBody.name, bookId))) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }

    Object.assign(book, bookBody);

    if (base64ImageString) {
      const bookImageArray = Array.isArray(base64ImageString) ? base64ImageString : [base64ImageString];

      // if bookImageArray has link, that not do anything
      if (bookImageArray[0].startsWith('http')) {
        await book.save();
        return book;
      }

      // if base64ImageString is base64 string, delete old images and upload new images
      await deleteBookImages(book.images);

      bookImages = await uploadBookImages(bookImageArray, book._id);
      book.images = bookImages.map((image) => image._id);

      Promise.all([book.save(), BookImage.insertMany(bookImages)]).catch((err) => {
        deleteBookImages(bookImages).finally(() => {
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error updating book: ${err}`);
        });
      });
    }

    return book;
  } catch (error) {
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;

    if (error.statusCode) {
      statusCode = error.statusCode;
    }

    throw new ApiError(statusCode, error.message);
  }
};

/**
 * Delete book by id
 * @param {ObjectId} bookId
 * @returns {Promise<Book>}
 */
const deleteBookById = async (bookId) => {
  const book = await Book.findById(bookId).populate('images');

  Object.keys(book.images).forEach(async (key) => {
    await deleteFile(bucket.IMAGES, book.images[key].key);
    await BookImage.deleteOne({ key: book.images[key].key });
  });

  await book.remove();
};

module.exports = {
  createBook,
  queryBooks,
  getBookById,
  updateBookById,
  deleteBookById,
};
