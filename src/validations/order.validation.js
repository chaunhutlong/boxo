const Joi = require('joi');
let { shippingStatuses } = require('../config/shipping.enum');
let { paymentTypes } = require('../config/payment.enum');

shippingStatuses = Object.values(shippingStatuses);
paymentTypes = Object.values(paymentTypes);

const { objectId } = require('./custom.validation');

const paramsOrderId = Joi.object().keys({
  orderId: Joi.string().custom(objectId),
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

const paymentOrder = {
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

module.exports = {
  updateShipping,
  getOrders,
  paymentOrder,
  paramsOrderId,
  checkoutOrder,
};
