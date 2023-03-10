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

const getOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  // add request user to filter
  filter.user = req.user.id;
  const result = await orderService.queryOrders(filter, options);
  res.send(result);
});

const getOrderById = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId);
  res.send(order);
});

const paymentOrder = catchAsync(async (req, res) => {
  const order = await orderService.paymentOrder(req.user.id, req.body);
  res.send(order);
});

const checkoutOrder = catchAsync(async (req, res) => {
  const { orderId } = req.body;
  const order = await orderService.checkoutOrder(req.user.id, orderId);
  res.send(order);
});

module.exports = {
  getShippingByOrderId,
  updateShipping,
  getOrders,
  getOrderById,
  paymentOrder,
  checkoutOrder,
};
