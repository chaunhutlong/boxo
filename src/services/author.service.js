const httpStatus = require('http-status');
const { Author } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a author
 * @param {Object} authorBody
 * @returns {Promise<Author>}
 */
const createAuthor = async (authorBody) => {
  const author = await Author.create(authorBody);
  return author;
};

/**
 * Query for authors
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryAuthors = async (filter, options) => {
  const authors = await Author.paginate(filter, options);
  return authors;
};

/**
 * Get author by id
 * @param {ObjectId} id
 * @returns {Promise<Author>}
 */
const getAuthorById = async (id) => {
  const author = await Author.findById(id);
  if (!author) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Author not found');
  }
  return author;
};

/**
 * Update author by id
 * @param {ObjectId} authorId
 * @param {Object} updateBody
 * @returns {Promise<Author>}
 */
const updateAuthorById = async (authorId, updateBody) => {
  const author = await getAuthorById(authorId);

  if (updateBody.name && (await Author.isNameTaken(updateBody.name, authorId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }

  Object.assign(author, updateBody);

  await author.save();
  return author;
};

/**
 * Delete author by id
 * @param {ObjectId} authorId
 * @returns {Promise<Author>}
 */
const deleteAuthorById = async (authorId) => {
  const author = await getAuthorById(authorId);

  await author.remove();
};

module.exports = {
  createAuthor,
  queryAuthors,
  getAuthorById,
  updateAuthorById,
  deleteAuthorById,
};
