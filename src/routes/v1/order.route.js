const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const orderValidation = require('../../validations/order.validation');
const orderController = require('../../controllers/order.controller');

const router = express.Router();

router
  .route('/:orderId/shipping')
  .get(auth(), validate(orderValidation.paramsOrderId), orderController.getShippingByOrderId)
  .put(auth(), validate(orderValidation.updateShipping), orderController.updateShipping);

router.route('/').get(auth(), validate(orderValidation.getOrders), orderController.getOrders);

router.route('/payment').post(auth(), validate(orderValidation.processPaymentOrder), orderController.processPaymentOrder);

router.route('/checkout').post(auth(), validate(orderValidation.checkoutOrder), orderController.checkoutOrder);

router.route('/all').get(auth(), validate(orderValidation.getOrders), orderController.getAllUserOrders);

router.route('/user/:userId').get(auth(), validate(orderValidation.paramsUserId), orderController.getOrdersByUserId);

router
  .route('/:orderId')
  .get(auth(), validate(orderValidation.paramsOrderId), orderController.getOrderById)
  .put(auth(), validate(orderValidation.updateOrder), orderController.updateOrder);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order management and retrieval
 */
