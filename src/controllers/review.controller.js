const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { reviewService } = require('../services');

const createReview = catchAsync(async (req, res) => {
  const review = await reviewService.createReview(req.user.id, req.body);
  res.status(httpStatus.CREATED).send(review);
});

const getReviews = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['bookId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = 'user';
  const result = await reviewService.queryReviews(filter, options);
  res.send(result);
});

const getReview = catchAsync(async (req, res) => {
  const review = await reviewService.getReviewById(req.params.reviewId);
  res.send(review);
});

const updateReview = catchAsync(async (req, res) => {
  const review = await reviewService.updateReviewById(req.params.reviewId, req.body);
  res.send(review);
});

const deleteReview = catchAsync(async (req, res) => {
  await reviewService.deleteReviewById(req.params.reviewId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getReiewsByBookId = catchAsync(async (req, res) => {
  const reviews = await reviewService.getReviewsByBookId(req.params.bookId);
  res.send(reviews);
});

module.exports = {
  createReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview,
  getReiewsByBookId,
};
