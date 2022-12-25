const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPublisher = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    address: Joi.string().allow(null, ''),
    phone: Joi.string().allow(null, ''),
    email: Joi.string().email().allow(null, ''),
    description: Joi.string().allow(null, ''),
  }),
};

const getPublishers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPublisher = {
  params: Joi.object().keys({
    publisherId: Joi.string().custom(objectId),
  }),
};

const updatePublisher = {
  params: Joi.object().keys({
    publisherId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      address: Joi.string().allow(null, ''),
      phone: Joi.string().allow(null, ''),
      email: Joi.string().email().allow(null, ''),
      description: Joi.string().allow(null, ''),
    })
    .min(1),
};

const deletePublisher = {
  params: Joi.object().keys({
    publisherId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createPublisher,
  getPublishers,
  getPublisher,
  updatePublisher,
  deletePublisher,
};
