const express = require('express');
const auth = require('../../middlewares/auth');
const notificationController = require('../../controllers/notification.controller');

const router = express.Router();

router.route('/').get(auth(), notificationController.getNotificationByUserId);

module.exports = router;
