const { Notification } = require('../models');

const getNotificationByUserId = async (userId) => {
  return Notification.find({ userId });
};

const createNotification = async (notificationBody) => {
  return Notification.create(notificationBody);
};

module.exports = {
  getNotificationByUserId,
  createNotification,
};
