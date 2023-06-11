const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createBook = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    availableQuantity: Joi.number().required().min(0),
    isbn: Joi.string().required().max(13),
    language: Joi.string().required(),
    totalPages: Joi.number().required().min(0),
    priceDiscount: Joi.number().min(0).allow(null, ''),
    price: Joi.number().min(0).required(),
    description: Joi.string().allow(null, ''),
    publisherId: Joi.string().custom(objectId).required(),
    publishedDate: Joi.date().required(),
    authors: Joi.any().required(),
    genres: Joi.any().required(),
    images: Joi.any().allow(null, ''),
  }),
};

const getBooks = {
  query: Joi.object().keys({
    genres: Joi.any(),
    price: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    search: Joi.string().allow(null, ''),
    query: Joi.string().allow(null, ''),
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
      priceDiscount: Joi.number().min(0),
      price: Joi.number().min(0),
      description: Joi.string().allow(null, ''),
      publisherId: Joi.string().custom(objectId),
      publishedDate: Joi.date(),
      images: Joi.any().allow(null, ''),
      authors: Joi.any(),
      genres: Joi.any(),
    })
    .min(1),
};

const deleteBook = {
  params: Joi.object().keys({
    bookId: Joi.string().custom(objectId),
  }),
};

const searchBooks = {
  query: Joi.object().keys({
    query: Joi.string().allow(null, ''),
    search: Joi.string().required(),
    sortBy: Joi.string().allow(null, ''),
    limit: Joi.number().allow(null, '').integer(),
    page: Joi.number().allow(null, '').integer(),
  }),
};

const getBookByISBN = {
  params: Joi.object().keys({
    isbn: Joi.string().required(),
  }),
};

const getRecommendBooksByBookId = {
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
  searchBooks,
  getBookByISBN,
  getRecommendBooksByBookId,
};
