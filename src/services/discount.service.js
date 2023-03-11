const httpStatus = require('http-status');
const { Discount } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a discount
 * @param {Object} discountBody
 * @returns {Promise<Discount>}
 */
const createDiscount = async (discountBody) => {
  if (await Discount.isNameTaken(discountBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }
  const discount = await Discount.create(discountBody);
  return discount;
};

/**
 * Query for discounts
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryDiscounts = async (filter, options) => {
  const discounts = await Discount.paginate(filter, options);
  return discounts;
};

/**
 * Get discount by id
 * @param {ObjectId} id
 * @returns {Promise<Discount>}
 */
const getDiscountById = async (id) => {
  const discount = await Discount.findById(id);
  if (!discount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Discount not found');
  }
  return discount;
};

/**
 * Update discount by id
 * @param {ObjectId} discountId
 * @param {Object} updateBody
 * @returns {Promise<Discount>}
 */
const updateDiscountById = async (discountId, updateBody) => {
  const discount = await getDiscountById(discountId);

  if (updateBody.name && (await Discount.isNameTaken(updateBody.name, discountId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }

  Object.assign(discount, updateBody);

  await discount.save();
  return discount;
};

/**
 * Delete discount by id
 * @param {ObjectId} discountId
 */
const deleteDiscountById = async (discountId) => {
  const discount = await getDiscountById(discountId);

  await discount.remove();
};

/**
 * Get public discounts
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */

const getPublicDiscounts = async (filter, options) => {
  filter.isPublic = true;
  const discounts = await Discount.paginate(filter, options);
  return discounts;
};

module.exports = {
  createDiscount,
  queryDiscounts,
  getDiscountById,
  updateDiscountById,
  deleteDiscountById,
  getPublicDiscounts,
};
