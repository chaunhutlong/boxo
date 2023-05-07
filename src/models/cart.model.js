const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const bookSchema = mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      min: 0,
      required: true,
    },
    priceDiscount: {
      type: Number,
      min: 0,
    },
    imageUrl: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    isChecked: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const cartSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [bookSchema],
});

cartSchema.plugin(toJSON);

/**
 * @typedef Cart
 * @property {ObjectId} userId
 * @property {ObjectId} items
 */

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
