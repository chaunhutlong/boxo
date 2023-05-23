const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { addressService } = require('../services');

const createAddress = catchAsync(async (req, res) => {
  const address = await addressService.createAddress(req.user.id, req.body);
  res.status(httpStatus.CREATED).send(address);
});

const queryAddresses = catchAsync(async (req, res) => {
  const result = await addressService.queryAddresses();
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
  queryAddresses,
  getAddress,
  updateAddress,
  deleteAddress,
};
