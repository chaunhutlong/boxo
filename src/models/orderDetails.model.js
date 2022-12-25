const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const orderDetailsSchema = mongoose.Schema({
  order: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Order',
    required: true,
  },
  book: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Book',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

// add plugin that converts mongoose to json
orderDetailsSchema.plugin(toJSON);
orderDetailsSchema.plugin(paginate);

/**
 * @typedef OrderDetails
 * @property {ObjectId} order
 * @property {ObjectId} book
 * @property {number} quantity
 * @property {number} price
 */

const OrderDetails = mongoose.model('OrderDetails', orderDetailsSchema);

module.exports = OrderDetails;
