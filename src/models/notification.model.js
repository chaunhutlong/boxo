const mongoose = require('mongoose');
const { notificationTypes } = require('../config/notification.enum');

const notificationSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Order',
  },
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: notificationTypes,
  },
  title: {
    type: String,
  },
  content: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
