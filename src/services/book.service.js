const httpStatus = require('http-status');
const { Book } = require('../models');
const ApiError = require('../utils/ApiError');
const { getSignedUrl, deleteFilesFromS3, uploadImagesBase64 } = require('../utils/s3');
const { parseBase64Image } = require('../utils/base64');
const { bucket } = require('../config/s3.enum');

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

  // if you don't have the imageCover, get the first image
  if (!bookBody.imageCover && bookBody.images.length > 0) {
    [bookBody.imageCover] = bookBody.images;
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

module.exports = {
  createBook,
  queryBooks,
  getBookById,
  updateBookById,
  deleteBookById,
};
