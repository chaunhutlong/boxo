const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createDiscount = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().allow(null, ''),
  }),
};

const getDiscounts = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getDiscount = {
  params: Joi.object().keys({
    discountId: Joi.string().custom(objectId),
  }),
};

const updateDiscount = {
  params: Joi.object().keys({
    discountId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string().allow(null, ''),
    })
    .min(1),
};

const deleteDiscount = {
  params: Joi.object().keys({
    discountId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createDiscount,
  getDiscounts,
  getDiscount,
  updateDiscount,
  deleteDiscount,
};
