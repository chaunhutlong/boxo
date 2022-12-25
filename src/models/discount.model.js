const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const discountSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    books: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
    discountType: {
      type: String,
      required: true,
      enum: ['percent', 'amount'],
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

discountSchema.plugin(toJSON);

/**
 * @typedef Discount
 * @property {string} name
 * @property {string} code
 * @property {ObjectId} books
 * @property {string} discountType
 * @property {number} discountValue
 * @property {number} quantity
 * @property {Date} startDate
 * @property {Date} endDate
 * @property {boolean} isActive
 * @property {boolean} isDeleted
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {Date} deletedAt
 */

const Discount = mongoose.model('Discount', discountSchema);

module.exports = Discount;
