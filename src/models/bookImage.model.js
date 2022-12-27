const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { softDeletePlugin } = require('soft-delete-plugin-mongoose');

const bookImageSchema = mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
bookImageSchema.plugin(toJSON);
bookImageSchema.plugin(softDeletePlugin);

/**
 * @typedef BookImage
 * @property {string} url
 * @property {ObjectId} bookId
 * @property {boolean} isDeleted
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {Date} deletedAt
 */

const BookImage = mongoose.model('BookImage', bookImageSchema);

module.exports = BookImage;
