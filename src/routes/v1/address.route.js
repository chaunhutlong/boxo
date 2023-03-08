const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const addressValidation = require('../../validations/address.validation');
const addressController = require('../../controllers/address.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(addressValidation.createAddress), addressController.createAddress)
  .get(auth(), validate(addressValidation.getAddresses), addressController.getAddresss);

router
  .route('/:addressId')
  .get(auth(), validate(addressValidation.getAddress), addressController.getAddress)
  .put(auth(), validate(addressValidation.updateAddress), addressController.updateAddress)
  .delete(auth(), validate(addressValidation.deleteAddress), addressController.deleteAddress);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Addresss
 *   description: Address management and retrieval
 */

/**
 * @swagger
 * /addresss:
 *   post:
 *     summary: Create a address
 *     description: Logged in addresss can create only their own addresss
 *     tags: [Addresss]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               biography:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               deathDate:
 *                 type: string
 *                 format: date
 *             example:
 *               name: John Doe
 *               biography: John Doe is a fictional character created by American writer John Steinbeck.
 *               birthDate: 1902-02-27
 *               deathDate: 1968-12-20
 *
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Address'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unaddressized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all addresss
 *     description: Anyone can retrieve all addresss.
 *     tags: [Addresss]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of addresss
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Address'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unaddressized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /addresss/{id}:
 *   get:
 *     summary: Get a address
 *     description: Anyone can retrieve a address.
 *     tags: [Addresss]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Address'
 *       "401":
 *         $ref: '#/components/responses/Unaddressized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     summary: Update a address
 *     description: Admins and Managers can update other addresss.
 *     tags: [Addresss]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               biography:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               deathDate:
 *                 type: string
 *                 format: date
 *             example:
 *                 name: John Doe
 *                 biography: John Doe is a fictional character created by American writer John Steinbeck.
 *                 birthDate: 1902-02-27
 *                 deathDate: 1968-12-20
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Address'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unaddressized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a address
 *     description: Admins and Managers can delete other addresss.
 *     tags: [Addresss]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unaddressized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 */
