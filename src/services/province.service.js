const { City, Province } = require('../models');

/**
 * Get all provinces
 * @returns {Promise<Province>}
 */
const getProvinces = async () => {
  const provinces = await Province.find();
  return provinces;
};

/**
 * Get cities by provinceId
 * @param {ObjectId} provinceId
 * @returns {Promise<City>}
 */
const getCitiesByProvinceId = async (provinceId) => {
  const cities = await City.find({ provinceId });
  return cities;
};

module.exports = {
  getProvinces,
  getCitiesByProvinceId,
};
