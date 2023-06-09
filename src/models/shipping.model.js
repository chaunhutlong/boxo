const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { shippingStatuses } = require('../config/shipping.enum');

const addressSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  province: {
    type: String,
  },
});

const shippingSchema = mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: shippingStatuses,
      default: shippingStatuses.PENDING,
    },

    address: {
      type: addressSchema,
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

shippingSchema.statics.isTrackingNumberTaken = async function (trackingNumber, excludeOrderId) {
  const shipping = await this.findOne({ trackingNumber, _id: { $ne: excludeOrderId } });
  return !!shipping;
};

shippingSchema.statics.generateTrackingNumber = function (length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let trackingNumber = 'BOXO-';

  for (let i = 0; i < length; i += 1) {
    const randomChar = characters.charAt(Math.floor(Math.random() * characters.length));
    trackingNumber += randomChar;
  }

  // Generate a sequential number based on the current time
  const timestamp = Date.now();
  const sequentialNumber = timestamp.toString().slice(-6);
  trackingNumber += sequentialNumber;

  return trackingNumber;
};

shippingSchema.statics.calculateShippingValue = function (distance) {
  const baseRate = 10; // base rate per km
  const ratePerKm = 0.3; // rate per km
  let shippingCost = 0; // initialize shipping cost to 0

  // Calculate shipping cost based on distance using a switch statement
  switch (true) {
    case distance < 10:
      shippingCost = baseRate + distance * ratePerKm;
      break;
    case distance >= 10 && distance < 30:
      shippingCost = baseRate + distance * ratePerKm * 0.8;
      break;
    case distance >= 30 && distance < 100:
      shippingCost = baseRate + distance * ratePerKm * 0.6;
      break;
    case distance >= 100 && distance < 300:
      shippingCost = baseRate + distance * ratePerKm * 0.5;
      break;
    case distance >= 300:
      shippingCost = 60;
      break;
    default:
      shippingCost = 0; // if distance is not provided or invalid, set shipping cost to 0
  }

  // convert shipping cost to VND and format it to 2 decimal places
  shippingCost *= 1000;
  return parseFloat(shippingCost.toFixed(2));
};

/**
 * @typedef Shipping
 * @property {string} trackingNumber
 * @property {string} status
 * @property {ObjectId} addressId
 * @property {ObjectId} orderId
 * @property {number} value
 * @property {string} description
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const Shipping = mongoose.model('Shipping', shippingSchema);

module.exports = Shipping;
