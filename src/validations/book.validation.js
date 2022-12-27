const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createBook = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    availableQuantity: Joi.number().required().min(0),
    isbn: Joi.string().required().max(13),
    language: Joi.string().required(),
    totalPages: Joi.number().required().min(0),
    originalPrice: Joi.number().required().min(0),
    price: Joi.number().required().min(0),
    description: Joi.string().allow(null, ''),
    publisherId: Joi.string().custom(objectId).required(),
    publishedDate: Joi.date().required(),
  }),
};

const getBooks = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getBook = {
  params: Joi.object().keys({
    bookId: Joi.string().custom(objectId),
  }),
};

const updateBook = {
  params: Joi.object().keys({
    bookId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().allow(null, ''),
      availableQuantity: Joi.number().min(0),
      isbn: Joi.string().max(13),
      language: Joi.string(),
      totalPages: Joi.number().min(0),
      originalPrice: Joi.number().min(0),
      price: Joi.number().min(0),
      description: Joi.string().allow(null, ''),
      publisherId: Joi.string().custom(objectId),
      publishedDate: Joi.date(),
      images: Joi.array().items(Joi.string().custom(objectId)),
      authors: Joi.array().items(Joi.string().custom(objectId)),
      genres: Joi.array().items(Joi.string().custom(objectId)),
    })
    .min(1),
};

const deleteBook = {
  params: Joi.object().keys({
    bookId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
};
