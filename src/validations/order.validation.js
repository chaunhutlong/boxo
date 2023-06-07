const Joi = require('joi');
let { shippingStatuses } = require('../config/shipping.enum');
let { paymentTypes } = require('../config/payment.enum');

shippingStatuses = Object.values(shippingStatuses);
paymentTypes = Object.values(paymentTypes);

const { objectId } = require('./custom.validation');
let { orderStatuses } = require('../config/order.enum');

orderStatuses = Object.values(orderStatuses);

const paramsOrderId = Joi.object().keys({
  orderId: Joi.string().custom(objectId),
});
const updateOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid(...orderStatuses),
  }),
};
const paramsUserId = Joi.object().keys({
  userId: Joi.string().custom(objectId),
});

const updateShipping = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid(...shippingStatuses),
    addressId: Joi.string().custom(objectId),
    description: Joi.string().allow(''),
  }),
};

const getOrders = {
  query: Joi.object().keys({
    status: Joi.string().valid(...shippingStatuses),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const processPaymentOrder = {
  body: Joi.object().keys({
    type: Joi.string().valid(...paymentTypes),
    discountCode: Joi.string().allow(''),
  }),
};

const checkoutOrder = {
  body: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
};

const getOrderById = {
  query: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  updateShipping,
  getOrders,
  processPaymentOrder,
  paramsOrderId,
  checkoutOrder,
  getOrderById,
  paramsUserId,
  updateOrder,
};
