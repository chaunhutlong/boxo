const catchAsync = require('../utils/catchAsync');
const { provinceService } = require('../services');

const getProvinces = catchAsync(async (req, res) => {
  const provinces = await provinceService.getProvinces();
  res.send(provinces);
});

const getCitiesByProvinceId = catchAsync(async (req, res) => {
  const cities = await provinceService.getCitiesByProvinceId(req.params.provinceId);
  res.send(cities);
});

module.exports = {
  getProvinces,
  getCitiesByProvinceId,
};
