const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createReview = {
  body: Joi.object().keys({
    bookId: Joi.string().custom(objectId),
    userId: Joi.string().custom(objectId),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().required(),
  }),
};

const getReviews = {
  query: Joi.object().keys({
    bookId: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    search: Joi.string().allow(null, ''),
    query: Joi.string().allow(null, ''),
  }),
};

const getReview = {
  params: Joi.object().keys({
    reviewId: Joi.string().required(),
  }),
};

const updateReview = {
  params: Joi.object().keys({
    reviewId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      comment: Joi.string(),
      rating: Joi.number(),
    })
    .min(1),
};

const deleteReview = {
  params: Joi.object().keys({
    reviewId: Joi.string().required(),
  }),
};

module.exports = {
  createReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview,
};
