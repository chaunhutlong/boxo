const httpStatus = require('http-status');
const { Book, Order, Shipping, Address, Cart, Discount, Payment } = require('../models');
const { shippingStatuses } = require('../config/shipping.enum');
const { orderStatuses } = require('../config/order.enum');
const { discountTypes } = require('../config/discount.enum');
const ApiError = require('../utils/ApiError');

const getCart = async (userId) => {
  return Cart.findOne({ userId });
};

const validateCart = (cart) => {
  if (!cart || cart.items.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart is empty');
  }
};

const validateAddress = (address) => {
  if (!address) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No default address found');
  }
};

const getDefaultAddress = async (userId) => {
  return Address.findOne({ userId, isDefault: true }).populate({
    path: 'city',
    populate: {
      path: 'province',
    },
  });
};

const calculateShippingCost = async (distance) => {
  return Shipping.calculateShippingValue(distance);
};

const getAvailableDiscount = async (discountCode) => {
  return Discount.getAvailableDiscount(discountCode);
};

const calculateTotalPayment = async (cart, discountCode) => {
  let totalPayment = cart.items.reduce((total, item) => total + item.totalPrice, 0);
  let discount = null;

  if (discountCode) {
    discount = await getAvailableDiscount(discountCode);

    if (discount && totalPayment >= discount.minRequiredValue && discount.quantity > 0) {
      switch (discount.type) {
        case discountTypes.PERCENTAGE:
          totalPayment -= (totalPayment * discount.value) / 100;
          break;
        case discountTypes.FIXED:
          totalPayment -= discount.value;
          break;
        default:
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Unexpected discount type');
      }

      discount.quantity -= 1;
      await discount.save();
    }
  }

  return { totalPayment, discount };
};

const createOrder = async (userId, totalPayment, discount, items) => {
  return Order.create({
    user: userId,
    totalPayment,
    discount: discount && discount.id,
    books: items,
    status: orderStatuses.PENDING,
  });
};

const formatCityAddress = (city, name, phone, description) => {
  return {
    city: city && city.name,
    province: city.province && city.province.name,
    name,
    phone,
    description,
  };
};

const createShipping = async (address, shippingCost, orderId) => {
  return Shipping.create({
    address,
    value: shippingCost,
    trackingNumber: await Shipping.generateTrackingNumber(8),
    status: shippingStatuses.PENDING,
    order: orderId,
  });
};

const createPayment = async (orderId, totalPayment, type, discount) => {
  return Payment.create({
    orderId,
    value: totalPayment,
    type,
    discount: discount && discount.id,
  });
};

const updateOrderReferences = async (order, shippingId, paymentId) => {
  order.shipping = shippingId;
  order.payment = paymentId;
  await order.save();
};

const updateBookQuantities = async (items) => {
  const bookUpdates = items.map((item) => ({
    updateOne: {
      filter: { _id: item.bookId },
      update: { $inc: { availableQuantity: -item.quantity } },
    },
  }));
  await Book.bulkWrite(bookUpdates);
};

const clearCart = async (cart) => {
  cart.items = [];
  await cart.save();
};

/**
 * Get shipping by orderId
 * @param {ObjectId} orderId
 * @returns {Promise<Shipping>}
 */

const getShippingByOrderId = async (orderId) => {
  return Shipping.findOne({ order: orderId });
};

/**
 * Update shipping by orderId
 * @param {ObjectId} orderId
 * @param {Object} updateBody
 * @returns {Promise<Shipping>}
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
  return Order.paginate(filter, options);
};

/**
 * Get order by id
 * @param {ObjectId} id
 * @returns {Promise<Order>}
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
  const cart = await getCart(userId);
  validateCart(cart);

  const { totalPayment, discount } = await calculateTotalPayment(cart, paymentDetails.discountCode);

  const address = await getDefaultAddress(userId);
  validateAddress(address);

  const shippingCost = await calculateShippingCost(address.distance);
  const totalPaymentWithShipping = totalPayment + shippingCost;

  const order = await createOrder(userId, totalPaymentWithShipping, discount, cart.items);
  const cityAddress = formatCityAddress(address.city, address.name, address.phone, address.description);
  const shipping = await createShipping(cityAddress, shippingCost, order._id);
  const payment = await createPayment(order._id, totalPaymentWithShipping, paymentDetails.type, discount);

  await updateOrderReferences(order, shipping._id, payment._id);
  await updateBookQuantities(cart.items);

  await clearCart(cart);

  return order;
};

const findPendingPayment = async (orderId) => {
  return Payment.findOne({ orderId, isPaid: false });
};

const validatePayment = (payment) => {
  if (!payment) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No payment found');
  }
};

const processPayment = async (payment) => {
  // Implement payment gateway logic here
  payment.isPaid = true;
  await payment.save();
};

const findOrderWithShipping = async (orderId) => {
  return Order.findById(orderId).populate('shipping');
};

const updateOrderAndShippingStatus = async (order) => {
  order.status = orderStatuses.PAID;
  order.shipping.status = shippingStatuses.SHIPPED;

  await Promise.all([order.save(), order.shipping.save()]);
};

/**
 * Checkout order
 * @param {ObjectId} userId
 * @param {ObjectId} orderId
 * @returns {Promise<Order>}
 */
const checkoutOrder = async (userId, orderId) => {
  try {
    const payment = await findPendingPayment(orderId);
    validatePayment(payment);

    await processPayment(payment);

    const order = await findOrderWithShipping(orderId);
    await updateOrderAndShippingStatus(order);

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
