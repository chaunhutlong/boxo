const httpStatus = require('http-status');
const { Cart, Book } = require('../models');
const ApiError = require('../utils/ApiError');
const { getSignedUrl } = require('../utils/s3');
const { bucket } = require('../config/s3.enum');

const findCartItemByBookId = (cartItems, bookId) => {
  return cartItems.find((item) => item.bookId.toString() === bookId);
};

const addToCart = async (userId, addToCartData) => {
  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({ userId });
    }

    const book = await Book.findById(addToCartData.bookId);
    if (!book) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
    }

    if (book.availableQuantity < addToCartData.quantity) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Not enough quantity');
    }

    const existingCartItem = findCartItemByBookId(cart.items, addToCartData.bookId);

    if (existingCartItem) {
      existingCartItem.quantity += addToCartData.quantity;
      existingCartItem.totalPrice += book.price * addToCartData.quantity;
    } else {
      cart.items.push({
        bookId: book._id,
        name: book.name,
        price: book.price,
        priceDiscount: book.priceDiscount,
        imageUrl: getSignedUrl(bucket.IMAGES, book.imageCover.key),
        quantity: addToCartData.quantity,
        totalPrice: book.price * addToCartData.quantity,
      });
    }

    await Promise.all([cart.save(), book.save()]);

    return cart;
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getCart = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
    }

    return cart;
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

const updateCart = async (userId, bookBody) => {
  try {
    const cart = await Cart.findOne({ userId });

    if (cart) {
      const existingCartItem = findCartItemByBookId(cart.items, bookBody.bookId);

      if (existingCartItem) {
        const book = await Book.findById(bookBody.bookId);
        if (book.availableQuantity < bookBody.quantity) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Not enough quantity');
        }

        existingCartItem.quantity = bookBody.quantity;
        existingCartItem.totalPrice = book.price * bookBody.quantity;
      }

      await cart.save();
    }
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

const removeItemFromCart = async (userId, bookBody) => {
  try {
    const cart = await Cart.findOne({ userId });

    if (cart) {
      const existingCartItem = findCartItemByBookId(cart.items, bookBody.bookId);

      if (existingCartItem) {
        cart.items = cart.items.filter((item) => item.bookId.toString() !== bookBody.bookId);
      }

      await cart.save();

      return cart;
    }
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

const clearCart = async (userId) => {
  const cart = await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } }, { upsert: true, new: true });

  return cart;
};

const updateCartCheckStatus = async (userId, bookBody) => {
  const cart = await Cart.findOneAndUpdate(
    { userId, 'items.bookId': bookBody.bookId },
    { $set: { 'items.$.isChecked': bookBody.isChecked } },
    { new: true }
  );

  return cart;
};

const updateAllCartItemsCheckStatus = async (userId, bookBody) => {
  const cart = await Cart.findOneAndUpdate(
    { userId },
    { $set: { 'items.$[].isChecked': bookBody.isChecked } },
    { new: true }
  );

  return cart;
};

module.exports = {
  addToCart,
  getCart,
  updateCart,
  removeItemFromCart,
  clearCart,
  updateCartCheckStatus,
  updateAllCartItemsCheckStatus,
};
