const { notificationService } = require('../services');

const getNotificationByUserId = async (req, res) => {
  const notifications = await notificationService.getNotificationByUserId(req.user.id);
  res.send(notifications);
};

module.exports = {
  getNotificationByUserId,
};
