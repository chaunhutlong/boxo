const httpStatus = require('http-status');
const { Genre } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a genre
 * @param {Object} genreBody
 * @returns {Promise<Genre>}
 */
const createGenre = async (genreBody) => {
  if (await Genre.isNameTaken(genreBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }
  return Genre.create(genreBody);
};

/**
 * Query for genres
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryGenres = async (filter, options) => {
  return Genre.paginate(filter, options);
};

/**
 * Get genre by id
 * @param {ObjectId} id
 * @returns {Promise<Genre>}
 */
const getGenreById = async (id) => {
  const genre = await Genre.findById(id);
  if (!genre) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Genre not found');
  }
  return genre;
};

/**
 * Update genre by id
 * @param {ObjectId} genreId
 * @param {Object} updateBody
 * @returns {Promise<Genre>}
 */
const updateGenreById = async (genreId, updateBody) => {
  const genre = await getGenreById(genreId);

  if (updateBody.name && (await Genre.isNameTaken(updateBody.name, genreId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }

  Object.assign(genre, updateBody);

  await genre.save();
  return genre;
};

/**
 * Delete genre by id
 * @param {ObjectId} genreId
 */
const deleteGenreById = async (genreId) => {
  const genre = await getGenreById(genreId);

  await genre.remove();
};

module.exports = {
  createGenre,
  queryGenres,
  getGenreById,
  updateGenreById,
  deleteGenreById,
};
