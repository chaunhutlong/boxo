const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const publisherValidation = require('../../validations/publisher.validation');
const publisherController = require('../../controllers/publisher.controller');
const { roles } = require('../../config/role.enum');

const router = express.Router();

router
  .route('/')
  .post(auth(roles.ADMIN, roles.MANAGER), validate(publisherValidation.createPublisher), publisherController.createPublisher)
  .get(validate(publisherValidation.getPublishers), publisherController.getPublishers);

router
  .route('/:publisherId')
  .get(validate(publisherValidation.getPublisher), publisherController.getPublisher)
  .put(auth(roles.ADMIN, roles.MANAGER), validate(publisherValidation.updatePublisher), publisherController.updatePublisher)
  .delete(
    auth(roles.ADMIN, roles.MANAGER),
    validate(publisherValidation.deletePublisher),
    publisherController.deletePublisher
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Publishers
 *   description: Publisher management and retrieval
 */

/**
 * @swagger
 * /publishers:
 *   post:
 *     summary: Create a publisher
 *     description: Admins and Managers can create other publishers.
 *     tags: [Publishers]
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
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               description:
 *                 type: string
 *             example:
 *               name: Publisher 1
 *               address: 1234 Main St
 *               phone: 555-555-5555
 *               email:
 *               description: Publisher 1
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Publisher'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all publishers
 *     description: Anyone can retrieve all publishers.
 *     tags: [Publishers]
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
 *         description: Maximum number of publishers
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
 *                     $ref: '#/components/schemas/Publisher'
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
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /publishers/{id}:
 *   get:
 *     summary: Get a publisher
 *     description: Anyone can retrieve a publisher.
 *     tags: [Publishers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Publisher id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Publisher'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     summary: Update a publisher
 *     description: Admins and Managers can update other publishers.
 *     tags: [Publishers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Publisher id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                name:
 *                  type: string
 *                address:
 *                  type: string
 *                phone:
 *                  type: string
 *                email:
 *                  type: string
 *                  format: email
 *                description:
 *                  type: string
 *             example:
 *                name: Publisher 1
 *                address: 1234 Main St
 *                phone: 555-555-5555
 *                email: publisher@example.com
 *                description: Publisher 1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Publisher'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a publisher
 *     description: Admins and Managers can delete other publishers.
 *     tags: [Publishers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Publisher id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 */
