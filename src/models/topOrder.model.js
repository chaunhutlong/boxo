const mongoose = require('mongoose');

const topOrderSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    weekEndDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: false,
    capped: true,
    size: 1e3,
  }
);

/**
 * @typedef TopOrder
 * @property {number} userId
 * @property {number} orderId
 * @property {Date} weekStart
 * @property {Date} weekEnd
 * @property {number} total
 */

const TopOrder = mongoose.model('TopOrder', topOrderSchema);

module.exports = TopOrder;
