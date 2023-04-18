/* eslint-disable no-param-reassign */
/* eslint-disable prefer-const */
const { createSortingCriteria, getLimit, getPage, getSkip, getCount, getDocs } = require('./paginate.generic');
const { getSignedUrl } = require('../../utils/s3');
const { bucket } = require('../../config/s3.enum');

const paginateBook = (schema) => {
  /**
   * @typedef {Object} QueryResult
   * @property {Document[]} results - Results found
   * @property {number} page - Current page
   * @property {number} limit - Maximum number of results per page
   * @property {number} totalPages - Total number of pages
   * @property {number} totalResults - Total number of documents
   */
  /**
   * Query for documents with pagination
   * @param {Object} [filter] - Mongo filter
   * @param {Object} [options] - Query options
   * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas (,)
   * @param {string} [options.populate] - Populate data fields. Hierarchy of fields should be separated by (.). Multiple populating criteria should be separated by commas (,)
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @returns {Promise<QueryResult>}
   */
  schema.statics.paginate = async function (filter, options) {
    const sort = options.sortBy ? createSortingCriteria(options.sortBy) : 'createdAt';
    const limit = getLimit(options.limit);
    const page = getPage(options.page);
    const skip = getSkip(page, limit);

    const totalResults = await getCount(this, filter);
    let datas = await getDocs(this, filter, sort, skip, limit, options.populate);

    const totalPages = Math.ceil(totalResults / limit);

    if (datas.length) {
      datas = datas.map((data) => {
        const images = data.images.map((image) => {
          const presignedUrl = getSignedUrl(bucket.IMAGES, image.key);
          const result = {
            ...image.toObject(),
            url: presignedUrl,
          };
          delete result.key;
          return result;
        });
        return {
          ...data.toObject(),
          images,
        };
      });
    }

    const result = {
      datas,
      page,
      limit,
      totalPages,
      totalResults,
    };

    return result;
  };
};

module.exports = paginateBook;
