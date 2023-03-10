const httpStatus = require('http-status');
const { Book, BookImage } = require('../models');
const ApiError = require('../utils/ApiError');
const { getSignedUrl, deleteFileFromS3 } = require('../utils/s3');

const BUCKET = process.env.AWS_S3_BOOK_IMAGE_BUCKET;

async function deleteBookImages(bookImages) {
  Object.keys(bookImages).forEach(async (key) => {
    await deleteFileFromS3(BUCKET, bookImages[key].key);
    await BookImage.deleteOne({ key: bookImages[key].key });
  });

  return true;
}
async function uploadBookImages(bookImages, bookId) {
  const images = [];
  Object.keys(bookImages).forEach(async (key) => {
    const newImage = new BookImage({
      bookId,
      key: bookImages[key].key,
    });

    images.push(newImage._id);

    await newImage.save();
  });

  return images;
}

/**
 * Create a book
 * @param {Object} bookBody
 * @returns {Promise<Book>}
 */
const createBook = async (bookBody, bookImage) => {
  try {
    if (await Book.isNameTaken(bookBody.name)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }

    bookBody.genres = JSON.parse(bookBody.genres);
    bookBody.authors = JSON.parse(bookBody.authors);

    const book = new Book(bookBody);

    Object.keys(bookImage).forEach(async (key) => {
      const newImage = new BookImage({
        bookId: book._id,
        key: bookImage[key].key,
      });

      book.images.push(newImage._id);

      await newImage.save();
    });

    await book.save();
    return book;
  } catch (error) {
    if (bookImage) {
      Object.keys(bookImage).forEach(async (key) => {
        await deleteFileFromS3(BUCKET, bookImage[key].key);
      });
    }
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
const updateBookById = async (bookId, bookBody, bookImage) => {
  try {
    const book = await Book.findById(bookId).populate('images');

    if (!book) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
    }

    if (bookBody.name && (await Book.isNameTaken(bookBody.name, bookId))) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }

    // update genres and authors
    if (bookBody.genres) {
      bookBody.genres = JSON.parse(bookBody.genres);
    }

    if (bookBody.authors) {
      bookBody.authors = JSON.parse(bookBody.authors);
    }

    // update book
    Object.assign(book, bookBody);

    // upload new images and delete old images
    if (bookImage) {
      // delete old images
      await deleteBookImages(book.images);
      // upload new images
      const images = await uploadBookImages(bookImage, book._id);
      book.images = images;
    }

    await book.save();
    return book;
  } catch (error) {
    if (bookImage) {
      Object.keys(bookImage).forEach(async (key) => {
        await deleteFileFromS3(BUCKET, bookImage[key].key);
      });
    }
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

  // delete images
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
