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
  const shipping = await Shipping.findOne({ order: orderId });
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
  const order = await Order.findById(id).populate('books.bookId').populate('shipping').populate('payment');
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  return order;
};

/**
 * Payment order
 * @param {ObjectId} userId
 * @param {Object} paymentDetails
 * @returns {Promise<Order>}
 */
const processPaymentOrder = async (userId, paymentDetails) => {
  const cart = await Cart.findOne({ userId });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart is empty');
  }

  let totalPayment = cart.items.reduce((total, item) => total + item.totalPrice, 0);

  const address = await Address.findOne({ userId, isDefault: true }).populate({
    path: 'city',
    populate: {
      path: 'province',
    },
  });

  if (!address) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No default address found');
  }

  const discount = await Discount.getAvailableDiscount(paymentDetails.discountCode);

  if (discount && totalPayment >= discount.minRequiredValue && discount.quantity > 0) {
    // check min required value and max discount value
    switch (discount.type) {
      case 'percentage':
        totalPayment -= (totalPayment * discount.value) / 100;
        break;
      case 'value':
        totalPayment -= discount.value;
        break;
      default:
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Unexpected discount type');
    }

    // update discount quantity
    discount.quantity -= 1;
    await discount.save();
  }

  const shippingCost = await Shipping.calculateShippingValue(address.distance);

  // add shipping cost to total payment
  totalPayment += shippingCost;

  const order = await Order.create({
    user: userId,
    totalPayment,
    discount: discount && discount.id,
    books: cart.items,
    status: orderStatuses.PENDING,
  });

  const cityAddress = {
    city: address.city && address.city.name,
    province: address.city.province && address.city.province.name,
    name: address.name,
    phone: address.phone,
    description: address.description,
  };

  const shipping = await Shipping.create({
    address: cityAddress,
    value: shippingCost,
    trackingNumber: await Shipping.generateTrackingNumber(8),
    status: shippingStatuses.PENDING,
    order: order._id,
  });

  // Create payment
  const payment = await Payment.create({
    orderId: order._id,
    value: totalPayment,
    type: paymentDetails.type,
    discount: discount && discount.id,
  });

  // Update order and shipping references
  order.shipping = shipping._id;
  order.payment = payment._id;

  // clear cart to empty
  cart.items = [];
  await Promise.all([cart.save(), order.save()]);
  return order;
};

/**
 * Checkout order
 * @param {ObjectId} userId
 * @param {ObjectId} orderId
 * @returns {Promise<Order>}
 */
const checkoutOrder = async (userId, orderId) => {
  try {
    const payment = await Payment.findOne({ orderId, isPaid: false });

    if (!payment) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No payment found');
    }

    // Implement payment gateway then update payment status
    payment.isPaid = true;
    await payment.save();

    const order = await Order.findById(orderId).populate('shipping').populate('books.bookId');

    // Update order status
    order.status = orderStatuses.PAID;

    // Update shipping status
    order.shipping.status = shippingStatuses.SHIPPED;

    // Update books quantity
    const bookUpdates = order.books.map((book) => ({
      updateOne: {
        filter: { _id: book.bookId._id },
        update: { $inc: { quantity: -book.quantity } },
      },
    }));

    await Book.bulkWrite(bookUpdates);

    return order;
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  getShippingByOrderId,
  updateShipping,
  queryOrders,
  getOrderById,
  processPaymentOrder,
  checkoutOrder,
};
