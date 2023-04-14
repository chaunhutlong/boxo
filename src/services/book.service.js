const httpStatus = require('http-status');
const { Book, BookImage } = require('../models');
const ApiError = require('../utils/ApiError');
const { getSignedUrl, deleteFileFromS3, uploadBase64ToS3 } = require('../utils/s3');

const BUCKET = process.env.AWS_S3_BOOK_IMAGE_BUCKET;

async function deleteBookImages(bookImages) {
  const keys = Object.keys(bookImages).map((key) => bookImages[key].key);
  try {
    await deleteFileFromS3(BUCKET, keys);
    await BookImage.deleteMany({ key: { $in: keys } });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting book images');
  }
}

async function uploadBookImages(bookImageArray, bookId) {
  try {
    const images = [];
    const promises = [];

    for (let i = 0; i < bookImageArray.length; i += 1) {
      const base64String = bookImageArray[i];
      const fileName = `book_image_${bookId}_${i}.jpg`;

      const promise = uploadBase64ToS3(BUCKET, base64String, fileName).then((uploadedImage) => {
        const newImage = new BookImage({
          bookId,
          key: uploadedImage.Key,
        });
        images.push(newImage);
      });

      promises.push(promise);
    }
    await Promise.all(promises);
    return images;
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error uploading book image: ${err}`);
  }
}

/**
 * Create a book
 * @param {Object} bookBody
 * @returns {Promise<Book>}
 */
const createBook = async (bookBody, bookImageBase64) => {
  let bookImages;
  try {
    if (await Book.isNameTaken(bookBody.name)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }

    const book = new Book(bookBody);

    if (bookImageBase64) {
      bookImages = await uploadBookImages(bookImageBase64, book._id);
      book.images = bookImages.map((image) => image._id);
      await Promise.all([book.save(), BookImage.insertMany(bookImages)]);

      Promise.all([book.save(), BookImage.insertMany(bookImages)]).catch((err) => {
        deleteBookImages(bookImages).finally(() => {
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error creating book: ${err}`);
        });
      });
    } else {
      await book.save();
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
    book.images[key].url = getSignedUrl(BUCKET, book.images[key].key);
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
const updateBookById = async (bookId, bookBody, bookImageBase64) => {
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

    if (bookImageBase64) {
      const bookImageArray = Array.isArray(bookImageBase64) ? bookImageBase64 : [bookImageBase64];

      // if bookImageArray has link, that not do anything
      if (bookImageArray[0].startsWith('http')) {
        await book.save();
        return book;
      }

      // if bookImageBase64 is base64 string, delete old images and upload new images
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
    await deleteFileFromS3(BUCKET, book.images[key].key);
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
