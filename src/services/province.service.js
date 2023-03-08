const { City, Province } = require('../models');

/**
 * Get all provinces
 * @returns {Promise<Province>}
 */
const getProvinces = async () => {
  await Province.find();
};

/**
 * Get cities by provinceId
 * @param {ObjectId} provinceId
 * @returns {Promise<Cities>}
 */
const getCitiesByProvinceId = async (provinceId) => {
  await City.find({ provinceId });
};

module.exports = {
  getProvinces,
  getCitiesByProvinceId,
};
