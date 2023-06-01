const httpStatus = require('http-status');
const { Address, City, Shipping } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create an address
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

    address.distance = await City.getDistance(address.cityId);

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
 * Get all addresses
 * @param {ObjectId} userId
 * @returns {Promise<QueryResult>}
 */
const queryAddresses = async (userId) => {
  return Address.find({ userId }).populate('cityId');
};

/**
 * Get address by id
 * @param {ObjectId} id
 * @returns {Promise<Address>}
 */
const getAddressById = async (id) => {
  const address = await Address.findById(id).populate('cityId');
  if (!address) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
  }
  return address;
};

/**
 * Update address by id
 * @param {ObjectId} addressId
 * @param {ObjectId} userId
 * @param {Object} addressBody
 * @returns {Promise<Address>}
 */
const updateAddressById = async (addressId, userId, addressBody) => {
  const address = await getAddressById(addressId);

  if (addressBody.isDefault) {
    await Address.updateMany({ userId }, { isDefault: false });
  }

  if (addressBody.cityId) {
    address.distance = await City.getDistance(addressBody.cityId);
  }

  Object.assign(address, addressBody);

  await address.save();
  return address;
};

/**
 * Delete address by id
 * @param {ObjectId} addressId
 */
const deleteAddressById = async (addressId) => {
  const address = await getAddressById(addressId);

  await address.remove();
};

/**
 * Calculate shipping fee
 * @param {ObjectId} userId
 */
const calculateShippingCost = async (userId) => {
  const address = await Address.findOne({ userId, isDefault: true });

  if (!address) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
  }

  return Shipping.calculateShippingValue(address.distance);
};

module.exports = {
  createAddress,
  queryAddresses,
  getAddressById,
  updateAddressById,
  deleteAddressById,
  calculateShippingCost,
};
