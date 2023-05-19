const { City, Province } = require('../models');

/**
 * Get all provinces
 * @returns {Promise<Province>}
 */
const getProvinces = async () => {
  return Province.find();
};

/**
 * Get cities by provinceId
 * @param {ObjectId} provinceId
 * @returns {Promise<City>}
 */
const getCitiesByProvinceId = async (provinceId) => {
  return City.find({ provinceId });
};

module.exports = {
  getProvinces,
  getCitiesByProvinceId,
};
