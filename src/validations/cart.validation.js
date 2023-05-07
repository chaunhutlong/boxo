const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addToCart = {
  body: Joi.object().keys({
    bookId: Joi.string().custom(objectId).required(),
    quantity: Joi.number().required().min(1),
  }),
};

const updateCart = {
  body: Joi.object().keys({
    bookId: Joi.string().custom(objectId).required(),
    quantity: Joi.number().required().min(1),
  }),
};

const removeItemFromCart = {
  body: Joi.object().keys({
    bookId: Joi.string().custom(objectId).required(),
  }),
};

const updateCartCheckStatus = {
  body: Joi.object().keys({
    bookId: Joi.string().custom(objectId).required(),
    isChecked: Joi.boolean().required(),
  }),
};

const updateAllCartItemsCheckStatus = {
  body: Joi.object().keys({
    isChecked: Joi.boolean().required(),
  }),
};

const clearCart = {
  body: Joi.object().keys({
    bookId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  addToCart,
  updateCart,
  removeItemFromCart,
  updateCartCheckStatus,
  updateAllCartItemsCheckStatus,
  clearCart,
};
