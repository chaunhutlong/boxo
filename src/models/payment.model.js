const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { paymentTypes } = require('../config/payment.enum');

const paymentSchema = mongoose.Schema(
  {
    isPaid: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: paymentTypes,
      required: true,
    },
    orderId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Order',
      required: true,
    },
    discount: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Discount',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
paymentSchema.plugin(toJSON);

/**
 * @typedef Payment
 * @property {string} status
 * @property {number} value
 * @property {ObjectId} order
 * @property {string} description
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
