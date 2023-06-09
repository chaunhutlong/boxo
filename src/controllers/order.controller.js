const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { orderService } = require('../services');

const getShippingByOrderId = catchAsync(async (req, res) => {
  const shipping = await orderService.getShippingByOrderId(req.params.orderId);
  res.send(shipping);
});

const updateShipping = catchAsync(async (req, res) => {
  const shipping = await orderService.updateShipping(req.params.orderId, req.body);
  res.send(shipping);
});

const updateOrder = catchAsync(async (req, res) => {
  const order = await orderService.updateStatusOrder(req.params.orderId, req.body, res.io);
  res.send(order);
});

const getOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  filter.user = req.user.id;
  options.populate = 'books,shipping,payment,discount';

  const result = await orderService.queryOrders(filter, options);
  res.send(result);
});

const getOrderById = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId);
  res.send(order);
});

const processPaymentOrder = catchAsync(async (req, res) => {
  const order = await orderService.processPaymentOrder(req.user.id, req.body, res.io);
  res.send(order);
});

const checkoutOrder = catchAsync(async (req, res) => {
  const { orderId } = req.body;
  const order = await orderService.checkoutOrder(req.user.id, orderId);
  res.send(order);
});

const getAllUserOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await orderService.getAllOrders(filter, options);
  res.send(result);
});

const getOrdersByUserId = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const order = await orderService.getOrdersByUserId(req.params.userId, filter, options);
  res.send(order);
});

module.exports = {
  getShippingByOrderId,
  updateShipping,
  getOrders,
  getOrderById,
  processPaymentOrder,
  checkoutOrder,
  getAllUserOrders,
  getOrdersByUserId,
  updateOrder,
};
