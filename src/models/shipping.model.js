const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const shippingSchema = mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    address: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Address',
      required: true,
    },
    order: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Order',
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
shippingSchema.plugin(toJSON);

/**
 * @typedef Shipping
 * @property {string} trackingNumber
 * @property {string} status
 * @property {ObjectId} address
 * @property {ObjectId} order
 * @property {number} value
 * @property {string} description
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const Shipping = mongoose.model('Shipping', shippingSchema);

module.exports = Shipping;
