const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createReview = {
    body: Joi.object().keys({
        title: Joi.string().required(),
        content: Joi.string().required(),
        rating: Joi.number().required(),
        productId: Joi.string().required()
    })
}

const getReviews = {
    query: Joi.object().keys({
        productId: Joi.string().required()
    })
}

const getReview = {
    params: Joi.object().keys({
        reviewId: Joi.string().required()
    })
}

const updateReview = {
    params: Joi.object().keys({
        reviewId: Joi.string().required()
    }),
    body: Joi.object().keys({
        title: Joi.string(),
        content: Joi.string(),
        rating: Joi.number()
    })
}

const deleteReview = {
    params: Joi.object().keys({
        reviewId: Joi.string().required()
    })
}

module.exports = {
    createReview,
    getReviews,
    getReview,
    updateReview,
    deleteReview
}
