const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { discountService } = require('../services');

const createDiscount = catchAsync(async (req, res) => {
  const discount = await discountService.createDiscount(req.body);
  res.status(httpStatus.CREATED).send(discount);
});

const getDiscounts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'code', 'discountType', 'discountValue', 'status', 'isPublic']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await discountService.queryDiscounts(filter, options);
  res.send(result);
});

const getDiscount = catchAsync(async (req, res) => {
  const discount = await discountService.getDiscountById(req.params.discountId);

  res.send(discount);
});

const updateDiscount = catchAsync(async (req, res) => {
  const discount = await discountService.updateDiscountById(req.params.discountId, req.body);
  res.send(discount);
});

const deleteDiscount = catchAsync(async (req, res) => {
  await discountService.deleteDiscountById(req.params.discountId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getPublicDiscounts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'code', 'discountType', 'discountValue', 'status', 'isPublic']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const result = await discountService.queryDiscounts(filter, options);
  res.send(result);
});

module.exports = {
  createDiscount,
  getDiscounts,
  getDiscount,
  updateDiscount,
  deleteDiscount,
  getPublicDiscounts,
};
