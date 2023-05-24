const httpStatus = require('http-status');
const { Review } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a review
 * @param {Object} reviewBody
 * @returns {Promise<Review>}
 */
const createReview = async (currentUserId, reviewBody) => {
    const { bookId, rating, comment } = reviewBody;
    const user = currentUserId;
    const review = new Review({
        bookId,
        user,
        rating,
        comment
    });
    await review.save();
    return review.populate('user').execPopulate();
    };

/**
 *  Query for reviews
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryReviews = async (filter, options) => {
    return Review.paginate(filter, options);
};

/**
 * Get review by id
 * @param {ObjectId} id
 * @returns {Promise<Review>}
 * */
const getReviewById = async (id) => {
    const review = await Review.findById(id);
    if (!review) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
    }
    return review;
};

/**
 * Update review by id
 * @param {ObjectId} reviewId
 * @param {Object} updateBody
 * @returns {Promise<Review>}
 * */
const updateReviewById = async (reviewId, updateBody) => {
    const review = await Review.findById(reviewId);

    if(!review) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
    }

    const { comment, rating } = updateBody;

    review.comment = comment;
    review.rating = rating;

    await review.save();
    return review;
};

/**
 * Delete review by id
 * @param {ObjectId} reviewId
 * @returns {Promise<Review>}
 * */
const deleteReviewById = async (reviewId) => {
    const review = await getReviewById(reviewId);
    await review.remove();
    return review;
}

module.exports = {
    createReview,
    queryReviews,
    getReviewById,
    updateReviewById,
    deleteReviewById,
};
