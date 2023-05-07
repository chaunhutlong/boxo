const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const cartValidation = require('../../validations/cart.validation');
const cartController = require('../../controllers/cart.controller');

const router = express.Router();

router.post('/add-to-cart', auth(), validate(cartValidation.addToCart), cartController.addToCart);

router.get('/get', auth(), cartController.getCart);

router.put('/update', auth(), validate(cartValidation.updateCart), cartController.updateCart);

router.put('/remove', auth(), validate(cartValidation.removeItemFromCart), cartController.removeItemFromCart);

router.put('/clear', auth(), cartController.clearCart);

router.put('/checked-item', auth(), validate(cartValidation.updateCartCheckStatus), cartController.updateCartCheckStatus);

router.put(
  '/checked-all-items',
  auth(),
  validate(cartValidation.updateAllCartItemsCheckStatus),
  cartController.updateAllCartItemsCheckStatus
);
module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management and retrieval
 */

/**
 * @swagger
 * /cart/add-to-cart:
 *   post:
 *     summary: Add to cart
 *     description: Logged in users can add to cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *               - quantity
 *             properties:
 *               bookId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *             example:
 *               bookId: 5f1f9b9a0f1cfc3b94f491c5
 *               quantity: 1
 *     responses:
 *       "201":
 *         description: Added to cart
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Cart'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 */

/**
 * @swagger
 * /cart/get:
 *   get:
 *     summary: Get cart of logged in user
 *     description: All logged in users can fetch their cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /cart/update:
 *   put:
 *     summary: Update cart
 *     description: Logged in users can update their cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                bookId:
 *                  type: string
 *                quantity:
 *                  type: integer
 *             example:
 *                bookId: 5f1f9b9a0f1cfc3b94f491c5
 *                quantity: 1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Cart'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /cart/remove:
 *   put:
 *     summary: Remove item from cart
 *     description: Logged in users can remove item from their cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                bookId:
 *                  type: string
 *             example:
 *                bookId: 5f1f9b9a0f1cfc3b94f491c5
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Cart'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /cart/clear:
 *   put:
 *     summary: Clear all items from cart
 *     description: Logged in users can clear all items from their cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                bookId:
 *                  type: string
 *             example:
 *                bookId: 5f1f9b9a0f1cfc3b94f491c5
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Cart'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /cart/checked-item:
 *   put:
 *     summary: Check item in cart
 *     description: Logged in users can check item in their cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                bookId:
 *                  type: string
 *                isChecked:
 *                  type: boolean
 *             example:
 *                bookId: 5f1f9b9a0f1cfc3b94f491c5
 *                isChecked: true
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Cart'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /cart/checked-all-items:
 *   put:
 *     summary: Check all items in cart
 *     description: Logged in users can check all items in their cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                isChecked:
 *                  type: boolean
 *             example:
 *                isChecked: true
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Cart'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
