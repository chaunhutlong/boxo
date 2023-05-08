const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { discountTypes } = require('../config/discount.enum');

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
    type: {
      type: String,
      required: true,
      enum: discountTypes,
    },
    value: {
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
    maxValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minRequiredValue: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isPublic: {
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
discountSchema.statics.getAvailableDiscount = async function (code) {
  const discount = await this.findOne({ code, isActive: true, isDeleted: false });

  // check expired date
  if (discount && (discount.endDate < new Date() || discount.startDate > new Date())) {
    discount.isActive = false;
    await discount.save();
    return false;
  }

  return discount;
};

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
 * @property {number} maxValue
 * @property {number} minRequiredValue
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {Date} deletedAt
 */

const Discount = mongoose.model('Discount', discountSchema);

module.exports = Discount;
