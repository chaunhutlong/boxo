const httpStatus = require('http-status');
const { Book } = require('../models');
const ApiError = require('../utils/ApiError');
const { getSignedUrl, deleteFilesFromS3, uploadImagesBase64 } = require('../utils/s3');
const { parseBase64Image } = require('../utils/base64');
const { bucket } = require('../config/s3.enum');

async function uploadBookImages(parsedImages, bookId) {
  try {
    const bookImages = await uploadImagesBase64(bucket.IMAGES, parsedImages, `book-${bookId}`);

    return bookImages;
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
  try {
    if (await Book.isNameTaken(bookBody.name)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }

    const book = new Book(bookBody);

    if (base64ImagesString) {
      const base64ImagesArray = Array.isArray(base64ImagesString) ? base64ImagesString : [base64ImagesString];

      const parsedImages = base64ImagesArray.map((base64Image) => parseBase64Image(base64Image));

      const uploads = await uploadBookImages(parsedImages, book._id);

      const bookImages = uploads.map(({ Key, Location }) => ({ key: Key, url: Location }));

      book.images = bookImages;
    }

    await book.save();

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
  const books = await Book.paginate(filter, { options });

  return books;
};

/**
 * Get book by id
 * @param {ObjectId} id
 * @returns {Promise<Book>}
 */
const getBookById = async (id) => {
  const book = await Book.findById(id).populate('genres').populate('authors').populate('publisher');

  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
  }

  Object.keys(book.images).forEach((key) => {
    book.images[key].url = getSignedUrl(bucket.IMAGES, book.images[key].key);
    book.images[key].key = undefined;
  });

  return book;
};

/**
 * Update book by id
 * @param {ObjectId} bookId
 * @param {Object} updateBody
 * @returns {Promise<Book>}
 */
const updateBookById = async (bookId, bookBody, base64ImagesString) => {
  let bookImages;
  try {
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
      const uploads = await uploadBookImages(parsedImages, book._id);

      bookImages = uploads.map(({ Key, Location }) => ({ key: Key, url: Location }));

      Object.keys(book.images).forEach(async (key) => {
        await deleteFilesFromS3(bucket.IMAGES, book.images[key].key);
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
    await deleteFilesFromS3(bucket.IMAGES, book.images[key].key);
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
