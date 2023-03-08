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

router.route('/payment').post(auth(), validate(orderValidation.paymentOrder), orderController.paymentOrder);

router.route('/checkout').post(auth(), validate(orderValidation.checkoutOrder), orderController.checkoutOrder);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order management and retrieval
 */
