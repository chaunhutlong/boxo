const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { cartService } = require('../services');

const addToCart = catchAsync(async (req, res) => {
  const cart = await cartService.addToCart(req.user.id, req.body);
  res.status(httpStatus.CREATED).send(cart);
});

const getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  res.send(cart);
});

const updateCart = catchAsync(async (req, res) => {
  const cart = await cartService.updateCart(req.user.id, req.body);
  res.send(cart);
});

const removeItemFromCart = catchAsync(async (req, res) => {
  const cart = await cartService.removeItemFromCart(req.user.id, req.body);
  res.send(cart);
});

const clearCart = catchAsync(async (req, res) => {
  const cart = await cartService.clearCart(req.user.id);
  res.send(cart);
});

const updateCartCheckStatus = catchAsync(async (req, res) => {
  const cart = await cartService.updateCartCheckStatus(req.user.id, req.body);
  res.send(cart);
});

const updateAllCartItemsCheckStatus = catchAsync(async (req, res) => {
  const cart = await cartService.updateAllCartItemsCheckStatus(req.user.id, req.body);
  res.send(cart);
});

module.exports = {
  addToCart,
  getCart,
  updateCart,
  removeItemFromCart,
  clearCart,
  updateCartCheckStatus,
  updateAllCartItemsCheckStatus,
};
