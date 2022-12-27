const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createAuthor = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    biography: Joi.string().allow(null, ''),
    birthDate: Joi.date().allow(null, ''),
    deathDate: Joi.date().allow(null, ''),
  }),
};

const getAuthors = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getAuthor = {
  params: Joi.object().keys({
    authorId: Joi.string().custom(objectId),
  }),
};

const updateAuthor = {
  params: Joi.object().keys({
    authorId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      biography: Joi.string().allow(null, ''),
      birthDate: Joi.date().allow(null, ''),
      deathDate: Joi.date().allow(null, ''),
    })
    .min(1),
};

const deleteAuthor = {
  params: Joi.object().keys({
    authorId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createAuthor,
  getAuthors,
  getAuthor,
  updateAuthor,
  deleteAuthor,
};
