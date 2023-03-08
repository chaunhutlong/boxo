const httpStatus = require('http-status');
const { Book, Order, Shipping, Address, Cart, Discount, Payment } = require('../models');
const { shippingStatuses } = require('../config/shipping.enum');
const { orderStatuses } = require('../config/order.enum');
const ApiError = require('../utils/ApiError');

/**
 * Get shipping by orderId
 * @param {ObjectId} orderId
 * @returns {Promise<Shipping>}
 */

const getShippingByOrderId = async (orderId) => {
  const shipping = await Shipping.findOne({ orderId }).populate('addressId').lean();
  return shipping;
};

/**
 * Update shipping by orderId
 * @param {ObjectId} orderId
 * @param {Object} updateBody
 * @returns {Promise<Shipping>}
 * @throws {NotFoundError}
 */
const updateShipping = async (orderId, updateBody) => {
  const shipping = await getShippingByOrderId(orderId);
  if (!shipping) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shipping not found');
  }
  Object.assign(shipping, updateBody);
  await shipping.save();
  return shipping;
};

/**
 * Get Orders
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */

const queryOrders = async (filter, options) => {
  const orders = await Order.paginate(filter, options);
  return orders;
};

/**
 * Get order by id
 * @param {ObjectId} id
 * @returns {Promise<Order>}
 * @throws {NotFoundError}
 */
const getOrderById = async (id) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  return order;
};

/**
 * Payment order
 * @param {ObjectId} userId
 * @param {Object} paymentBody
 * @returns {Promise<Order>}
 */
const paymentOrder = async (userId, paymentBody) => {
  const cartBooks = await Cart.find({
    userId,
    'books.isChecked': true,
  }).populate('books.bookId');

  if (cartBooks.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No books selected to payment');
  }

  let totalPayment = cartBooks[0].books.reduce((acc, book) => {
    return acc + book.bookId.price * book.quantity;
  }, 0);

  const address = await Address.findOne({ userId, isDefault: true });

  if (!address) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No default address found');
  }

  const discount = await Discount.getAvailableDiscount(paymentBody.discountCode);

  if (discount) {
    // check min required value and max discount value
    if (totalPayment >= discount.minRequiredValue && totalPayment >= discount.maxDiscountValue) {
      switch (discount.type) {
        case 'percentage':
          totalPayment -= (totalPayment * discount.value) / 100;
          break;
        case 'value':
          totalPayment -= discount.value;
          break;
        default:
          break;
      }

      // update discount quantity
      discount.quantity -= 1;
      await discount.save();
    }
  }

  const order = await Order.create({
    user: userId,
    totalPayment,
    discount: discount ? discount._id : null,
    books: cartBooks[0].books,
    status: orderStatuses.PENDING,
  });

  const shippingCost = await Shipping.calculateShippingValue(address.distance);

  // add shipping cost to total payment
  totalPayment += shippingCost;

  const shipping = await Shipping.create({
    address: address._id,
    value: shippingCost,
    trackingNumber: await Shipping.generateTrackingNumber(8),
    status: shippingStatuses.PENDING,
  });

  const payment = await Payment.create({
    order: order._id,
    value: totalPayment,
    type: paymentBody.type,
    discount: discount ? discount._id : null,
  });

  // update order and shipping
  order.shipping = shipping._id;
  order.payment = payment._id;

  // clear cart
  await Cart.deleteMany({ userId, 'books.isChecked': true });

  await order.save();
  return order;
};

const checkoutOrder = async (userId, orderId) => {
  const payment = await Payment.find({ order: orderId, isPaid: false });

  if (!payment) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No payment found');
  }

  // implement payment gateway then update payment status
  payment.isPaid = true;

  const order = await Order.findById(orderId).populate('shipping').populate('books.bookId').lean();

  // update order status
  order.status = orderStatuses.PAID;

  // update shipping status
  order.shipping.status = shippingStatuses.SHIPPED;

  // update books quantity
  const books = order.books.map((book) => {
    book.bookId.quantity -= book.quantity;
    return book.bookId;
  });

  await Book.bulkWrite(
    books.map((book) => ({
      updateOne: {
        filter: { _id: book._id },
        update: { quantity: book.quantity },
      },
    }))
  );

  await order.save();

  return order;
};

module.exports = {
  getShippingByOrderId,
  updateShipping,
  queryOrders,
  getOrderById,
  paymentOrder,
  checkoutOrder,
};
