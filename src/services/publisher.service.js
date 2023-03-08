const httpStatus = require('http-status');
const { Publisher } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a publisher
 * @param {Object} publisherBody
 * @returns {Promise<Publisher>}
 */
const createPublisher = async (publisherBody) => {
  const publisher = await Publisher.create(publisherBody);
  return publisher;
};

/**
 * Query for publishers
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryPublishers = async (filter, options) => {
  const publishers = await Publisher.paginate(filter, options);
  return publishers;
};

/**
 * Get publisher by id
 * @param {ObjectId} id
 * @returns {Promise<Publisher>}
 */
const getPublisherById = async (id) => {
  const publisher = await Publisher.findById(id);
  if (!publisher) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Publisher not found');
  }
  return publisher;
};

/**
 * Update publisher by id
 * @param {ObjectId} publisherId
 * @param {Object} updateBody
 * @returns {Promise<Publisher>}
 */
const updatePublisherById = async (publisherId, updateBody) => {
  const publisher = await getPublisherById(publisherId);

  if (updateBody.name && (await Publisher.isNameTaken(updateBody.name, publisherId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }

  Object.assign(publisher, updateBody);

  await publisher.save();
  return publisher;
};

/**
 * Delete publisher by id
 * @param {ObjectId} publisherId
 */
const deletePublisherById = async (publisherId) => {
  const publisher = await getPublisherById(publisherId);

  await publisher.remove();
};

module.exports = {
  createPublisher,
  queryPublishers,
  getPublisherById,
  updatePublisherById,
  deletePublisherById,
};
