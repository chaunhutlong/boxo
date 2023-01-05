const httpStatus = require('http-status');
const { Address, City } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a address
 * @param {ObjectId} userId
 * @param {Object} addressBody
 * @returns {Promise<Address>}
 */
const createAddress = async (userId, addressBody) => {
  try {
    const address = new Address({ ...addressBody, userId });

    if (address.isDefault) {
      await address.updateMany({ userId }, { isDefault: false });
    }

    const distance = await City.getDistance(address.cityId);

    address.distance = distance;

    await address.save();

    return address;
  } catch (error) {
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;

    if (error.statusCode) {
      statusCode = error.statusCode;
    }

    throw new ApiError(statusCode, error.message);
  }
};

/**
 * Query for addresss
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryAddresss = async (filter, options) => {
  const addresss = await Address.paginate(filter, options);
  return addresss;
};

/**
 * Get address by id
 * @param {ObjectId} id
 * @returns {Promise<Address>}
 */
const getAddressById = async (id) => {
  const address = await Address.findById(id);
  if (!address) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
  }
  return address;
};

/**
 * Update address by id
 * @param {ObjectId} addressId
 * @param {Object} updateBody
 * @returns {Promise<Address>}
 */
const updateAddressById = async (addressId, userId, addressBody) => {
  const address = await getAddressById(addressId);

  if (addressBody.isDefault) {
    await address.updateMany({ userId }, { isDefault: false });
  }

  if (addressBody.cityId) {
    const distance = await City.getDistance(addressBody.cityId);
    addressBody.distance = distance;
  }

  Object.assign(address, addressBody);

  await address.save();
  return address;
};

/**
 * Delete address by id
 * @param {ObjectId} addressId
 * @returns {Promise<Address>}
 */
const deleteAddressById = async (addressId) => {
  const address = await getAddressById(addressId);

  await address.remove();
  return address;
};

module.exports = {
  createAddress,
  queryAddresss,
  getAddressById,
  updateAddressById,
  deleteAddressById,
};
