const httpStatus = require('http-status');
const { Cart, Book } = require('../models');
const ApiError = require('../utils/ApiError');
const { getSignedUrl } = require('../utils/s3');

const BUCKET = process.env.AWS_S3_BOOK_IMAGE_BUCKET;

const addToCart = async (userId, bookBody) => {
  try {
    let cart;
    cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId });
    }

    const book = await Book.findById(bookBody.bookId);

    if (!book) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
    }

    if (book.availableQuantity < bookBody.quantity) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Not enough quantity');
    }

    // check if the book is already in the cart
    const bookInCart = cart.books.find((b) => b.bookId.toString() === bookBody.bookId);

    if (bookInCart) {
      bookInCart.quantity += bookBody.quantity;
    } else {
      cart.books.push({
        bookId: bookBody.bookId,
        quantity: bookBody.quantity,
        price: book.price,
      });
    }

    // update quantity of the book
    book.availableQuantity -= bookBody.quantity;

    await book.save();

    await cart.save();

    return cart;
  } catch (error) {
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;

    if (error.statusCode) {
      statusCode = error.statusCode;
    }

    throw new ApiError(statusCode, error.message);
  }
};

const getCart = async (userId) => {
  try {
    const cart = await Cart.findOne({
      userId,
    })
      .lean()
      .populate({
        path: 'books.bookId',
        populate: {
          path: 'images',
        },
      });

    if (!cart) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
    }

    Object.keys(cart.books).forEach(async (key) => {
      const book = cart.books[key].bookId;

      // set signed url for each image
      Object.keys(book.images).forEach(async (imageKey) => {
        book.images[imageKey].url = getSignedUrl(BUCKET, book.images[imageKey].key);
        delete book.images[imageKey].key;
        delete book.images[imageKey].bookId;
      });
    });

    return cart;
  } catch (error) {
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;

    if (error.statusCode) {
      statusCode = error.statusCode;
    }

    throw new ApiError(statusCode, error.message);
  }
};

const updateCart = async (userId, bookBody) => {
  try {
    const cart = await Cart.findOne({ userId });

    if (cart) {
      // check if the book is already in the cart
      const bookInCart = cart.books.find((b) => b.bookId.toString() === bookBody.bookId);

      if (bookInCart) {
        // check quantity of the book
        const book = await Book.findById(bookBody.bookId);

        if (book.availableQuantity < bookBody.quantity) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Not enough quantity');
        }

        const oldQuantity = bookInCart.quantity;

        bookInCart.quantity = bookBody.quantity;

        // update quantity of the book
        book.availableQuantity += oldQuantity - bookBody.quantity;

        await book.save();
      }

      await cart.save();

      return cart;
    }
  } catch (error) {
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;

    if (error.statusCode) {
      statusCode = error.statusCode;
    }

    throw new ApiError(statusCode, error.message);
  }
};

const removeItemFromCart = async (userId, bookBody) => {
  try {
    const cart = await Cart.findOne({ userId });

    if (cart) {
      // check if the book is already in the cart
      const bookInCart = cart.books.find((b) => b.bookId.toString() === bookBody.bookId);

      if (bookInCart) {
        // update quantity of the book
        const book = await Book.findById(bookBody.bookId);

        book.availableQuantity += bookInCart.quantity;

        await book.save();

        cart.books = cart.books.filter((b) => b.bookId.toString() !== bookBody.bookId);
      }

      await cart.save();

      return cart;
    }
  } catch (error) {
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;

    if (error.statusCode) {
      statusCode = error.statusCode;
    }

    throw new ApiError(statusCode, error.message);
  }
};

const clearCart = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
    }

    const books = await Book.find({ _id: { $in: cart.books.map((b) => b.bookId) } });

    books.forEach(async (book) => {
      const bookInCart = cart.books.find((b) => b.bookId.toString() === book.id);

      book.availableQuantity += bookInCart.quantity;

      await book.save();
    });

    cart.books = [];

    await cart.save();

    return cart;
  } catch (error) {
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;

    if (error.statusCode) {
      statusCode = error.statusCode;
    }

    throw new ApiError(statusCode, error.message);
  }
};

const addCheckedItem = async (userId, bookBody) => {
  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
    }

    // check if the book is already in the cart
    const bookInCart = cart.books.find((b) => b.bookId.toString() === bookBody.bookId);

    if (bookInCart) {
      bookInCart.isChecked = bookBody.isChecked;
    }

    await cart.save();

    return cart;
  } catch (error) {
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;

    if (error.statusCode) {
      statusCode = error.statusCode;
    }

    throw new ApiError(statusCode, error.message);
  }
};

const addAllCheckedItems = async (userId, bookBody) => {
  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
    }

    cart.books.forEach((book) => {
      book.isChecked = bookBody.isChecked;
    });

    await cart.save();

    return cart;
  } catch (error) {
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;

    if (error.statusCode) {
      statusCode = error.statusCode;
    }

    throw new ApiError(statusCode, error.message);
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCart,
  removeItemFromCart,
  clearCart,
  addCheckedItem,
  addAllCheckedItems,
};
