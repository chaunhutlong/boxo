const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createAddress = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    description: Joi.string().allow(null, ''),
    cityId: Joi.string().custom(objectId).required(),
    isDefault: Joi.boolean(),
  }),
};

const getAddresses = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getAddress = {
  params: Joi.object().keys({
    addressId: Joi.string().custom(objectId),
  }),
};

const updateAddress = {
  params: Joi.object().keys({
    addressId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      phone: Joi.string(),
      description: Joi.string().allow(null, ''),
      cityId: Joi.string().custom(objectId),
      isDefault: Joi.boolean().allow(null),
    })
    .min(1),
};

const deleteAddress = {
  params: Joi.object().keys({
    addressId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createAddress,
  getAddresses,
  getAddress,
  updateAddress,
  deleteAddress,
};
