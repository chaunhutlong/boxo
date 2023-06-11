const { createSortingCriteria, getLimit, getPage, getSkip, getCount, getDocs } = require('./paginate.generic');
const { getSignedUrl } = require('../../utils/s3');
const { bucket } = require('../../config/s3.enum');
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
 * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas (,)
 * @param {string} [options.populate] - Populate data fields. Hierarchy of fields should be separated by (.). Multiple populating criteria should be separated by commas (,)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 * @param schema
 */

const paginateBook = (schema) => {
  schema.statics.paginate = async function (filter, options) {
    const { query, genres, authors, search, publisher, price } = filter;

    // Apply text search if a search query is provided
    const textSearchQuery = search ? { $text: { $search: search } } : {};

    // Merge the text search query with the filter query
    const combinedFilter = { ...query, ...textSearchQuery };

    const genresArray = genres ? genres.split(',') : [];
    if (genresArray.length > 0) {
      combinedFilter.genres = { $in: genresArray };
    }
    if (authors) {
      combinedFilter.authors = { $in: authors };
    }

    if (publisher) {
      combinedFilter.publisher = publisher;
    }
    if (price) {
      const priceArray = price.split(',');
      if (priceArray.length > 1) {
        combinedFilter.price = { $gte: priceArray[0], $lte: priceArray[1] };
      } else {
        combinedFilter.price = { $gte: priceArray[0] };
      }
    }

    const sort = options.sortBy ? createSortingCriteria(options.sortBy) : 'createdAt';
    const limit = getLimit(options.limit);
    const page = getPage(options.page);
    const skip = getSkip(page, limit);

    const totalResults = await getCount(this, combinedFilter);
    let datas = await getDocs(this, combinedFilter, sort, skip, limit, options.populate);

    const totalPages = Math.ceil(totalResults / limit);

    if (datas.length) {
      datas = datas.map((data) => {
        if (datas.images && datas.images.length > 0) {
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
        }
        return data;
      });
    }

    return {
      datas,
      page,
      limit,
      totalPages,
      totalResults,
    };
  };
};

module.exports = paginateBook;
