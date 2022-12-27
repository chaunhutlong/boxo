const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createGenre = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().allow(null, ''),
  }),
};

const getGenres = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getGenre = {
  params: Joi.object().keys({
    genreId: Joi.string().custom(objectId),
  }),
};

const updateGenre = {
  params: Joi.object().keys({
    genreId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string().allow(null, ''),
    })
    .min(1),
};

const deleteGenre = {
  params: Joi.object().keys({
    genreId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createGenre,
  getGenres,
  getGenre,
  updateGenre,
  deleteGenre,
};
