const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const reviewSchema = mongoose.Schema(
  {
    book: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Book',
      required: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
reviewSchema.plugin(toJSON);

/**
 * @typedef Review
 * @property {ObjectId} book
 * @property {ObjectId} user
 * @property {number} rating
 * @property {string} comment
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
