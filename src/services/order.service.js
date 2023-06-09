const httpStatus = require('http-status');
const { Book, Order, Shipping, Address, Cart, Discount, Payment } = require('../models');
const { shippingStatuses } = require('../config/shipping.enum');
const { orderStatuses } = require('../config/order.enum');
const { discountTypes } = require('../config/discount.enum');
const { createSortingCriteria, getLimit, getPage } = require('../models/plugins/paginate.generic');
const ApiError = require('../utils/ApiError');
const { createNotification } = require('./notification.service');
const { notificationTypes } = require('../config/notification.enum');

const validateCart = (cart) => {
  if (!cart || cart.items.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart is empty');
  }
};

const getCheckedCart = async (userId) => {
  const cart = await Cart.findOne({ userId, 'items.isChecked': true });
  validateCart(cart);
  return cart;
};

const validateAddress = (address) => {
  if (!address) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No default address found');
  }
};

const getDefaultAddress = async (userId) => {
  return Address.findOne({ userId, isDefault: true }).populate({
    path: 'cityId',
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

const calculateTotalPayment = async (items, discountCode) => {
  let totalPayment = items.reduce((acc, item) => acc + item.totalPrice, 0);
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

const updateStatusOrder = async (orderId, orderStatus, socket) => {
  const order = await Order.findById(orderId);
  order.status = orderStatus.status;
  let title;
  switch (orderStatus.status) {
    case orderStatuses.PAID:
      title = 'Đơn hàng đã được thanh toán';
      break;
    case orderStatuses.SHIPPED:
      title = 'Đơn hàng đã được giao cho đơn vị vận chuyển';
      break;
    case orderStatuses.DELIVERED:
      title = 'Đơn hàng đã được giao thành công';
      break;
    case orderStatuses.CANCELED:
      title = 'Đơn hàng đã bị hủy';
      break;
    default:
      title = 'Đơn hàng đã được cập nhật';
      break;
  }

  const bodyNotification = {
    userId: order.user,
    type: notificationTypes.ORDER,
    title,
    orderId: order._id,
    orderStatus: order.status,
    content: `Đơn hàng ${order._id} của bạn đã được cập nhật sang trạng thái ${order.status}`,
  };

  await createNotification(bodyNotification);
  socket.to(order.user).emit('notification', { title });
  await order.save();
};
const updateOrderReferences = async (order, shippingId, paymentId) => {
  order.shipping = shippingId;
  order.payment = paymentId;
  await order.save();
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
  const order = await Order.findById(id).populate('books.bookId').populate('shipping').populate('payment').populate('user');
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  return order;
};

/**
 * Get order of all users
 * @returns {Promise<Order>}
 */
const getAllOrders = async (filter, options) => {
  const sortBy = options.sortBy ? createSortingCriteria(options.sortBy) : 'createdAt';
  const limit = getLimit(options.limit);
  const page = getPage(options.page);

  const countPromise = Order.countDocuments(filter);
  const ordersPromise = Order.find(filter)
    .populate('books.bookId')
    .populate('user')
    .populate('payment')
    .sort(sortBy)
    .skip((page - 1) * limit)
    .limit(limit);

  const [count, orders] = await Promise.all([countPromise, ordersPromise]);

  const mappedOrders = orders.map((order) => ({
    orderId: order._id,
    userId: order.user._id,
    userName: order.user.name,
    quantity: order.books.reduce((total, item) => total + item.quantity, 0),
    date: order.createdAt,
    paymentMethod: order.payment.type,
    totalPrice: order.totalPayment,
    status: order.status,
  }));

  return {
    datas: mappedOrders,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    totalResults: count,
  };
};

/**
 * Get order by user id
 * @param {ObjectId} userId
 * @param filter
 * @param options
 * @returns {Promise<Order>}
 */
const getOrdersByUserId = async (userId, filter, options) => {
  const { sortBy, limit = 10, page = 1 } = options;

  const ordersPromise = await Order.find({ user: userId, ...filter })
    .populate('books.bookId')
    .populate('shipping')
    .populate('payment')
    .sort(sortBy)
    .skip((page - 1) * limit)
    .limit(limit);
  const countPromise = Order.countDocuments({ user: userId, ...filter });
  const [count, orders] = await Promise.all([countPromise, ordersPromise]);
  return {
    datas: orders,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    totalResults: count,
  };
};

// Remove items checked from cart
const removeCheckedItems = async (cart, checkedItems) => {
  const bookUpdates = checkedItems.map((item) => ({
    updateOne: {
      filter: { _id: item.bookId },
      update: { $inc: { availableQuantity: -item.quantity } },
    },
  }));
  await Book.bulkWrite(bookUpdates);
  cart.items = cart.items.filter((item) => !item.isChecked);
  await cart.save();
};

/**
 * Payment order
 * @param {ObjectId} userId
 * @param {Object} paymentDetails
 * @param socket - socket io
 * @returns {Promise<Order>}
 */
const processPaymentOrder = async (userId, paymentDetails, socket) => {
  const cart = await getCheckedCart(userId);

  const checkedItems = cart.items.filter((item) => item.isChecked);

  const { totalPayment, discount } = await calculateTotalPayment(checkedItems, paymentDetails.discountCode);

  const address = await getDefaultAddress(userId);
  validateAddress(address);

  const shippingCost = await calculateShippingCost(address.distance);
  const totalPaymentWithShipping = totalPayment + shippingCost;

  const order = await createOrder(userId, totalPaymentWithShipping, discount, checkedItems);
  const cityAddress = formatCityAddress(address.cityId, address.name, address.phone, address.description);
  const shipping = await createShipping(cityAddress, shippingCost, order._id);
  const payment = await createPayment(order._id, totalPaymentWithShipping, paymentDetails.type, discount);

  await updateOrderReferences(order, shipping._id, payment._id);

  // Only remove items from cart where isChecked = true
  await removeCheckedItems(cart, checkedItems);

  const content = `Đơn hàng ${order._id} của bạn đã được đặt thành công`;
  const bodyNotification = {
    title: 'Đặt hàng thành công',
    content,
    type: notificationTypes.ORDER,
    userId,
    orderId: order._id,
    orderStatus: order.status,
  };

  // Create notification and emit to user
  await createNotification(bodyNotification);
  socket.to(userId).emit('notification', { content });

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
  getAllOrders,
  getOrdersByUserId,
  updateStatusOrder,
};
