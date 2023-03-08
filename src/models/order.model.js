const mongoose = require('mongoose');
const { softDeletePlugin } = require('soft-delete-plugin-mongoose');
const { toJSON, paginate } = require('./plugins');

const orderSchema = mongoose.Schema(
  {
    books: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Book',
        required: true,
      },
    ],
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    shipping: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Shipping',
    },
    payment: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Payment',
    },
    discount: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Discount',
    },
    totalPayment: {
      type: Number,
      required: true,
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

orderSchema.plugin(toJSON);
orderSchema.plugin(paginate);
orderSchema.plugin(softDeletePlugin);

/**
 * @typedef Order
 * @property {ObjectId} books
 * @property {ObjectId} user
 * @property {string} status
 * @property {ObjectId} shipping
 * @property {ObjectId} payment
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {Date} deletedAt
 * @property {boolean} isDeleted
 */

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
