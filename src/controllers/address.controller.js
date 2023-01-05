const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { addressService } = require('../services');

const createAddress = catchAsync(async (req, res) => {
  const address = await addressService.createAddress(req.user.id, req.body);
  res.status(httpStatus.CREATED).send(address);
});

const getAddresss = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await addressService.queryAddresss(filter, options);
  res.send(result);
});

const getAddress = catchAsync(async (req, res) => {
  const address = await addressService.getAddressById(req.params.addressId);

  res.send(address);
});

const updateAddress = catchAsync(async (req, res) => {
  const address = await addressService.updateAddressById(req.params.addressId, req.user.id, req.body);
  res.send(address);
});

const deleteAddress = catchAsync(async (req, res) => {
  await addressService.deleteAddressById(req.params.addressId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createAddress,
  getAddresss,
  getAddress,
  updateAddress,
  deleteAddress,
};
