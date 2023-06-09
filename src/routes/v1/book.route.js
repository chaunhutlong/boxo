const multer = require('multer');
const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const bookValidation = require('../../validations/book.validation');
const bookController = require('../../controllers/book.controller');

const { roles } = require('../../config/role.enum');

const upload = multer();
const router = express.Router();

router
  .route('/')
  .post(auth(roles.ADMIN, roles.MANAGER), upload.array(), validate(bookValidation.createBook), bookController.createBook)
  .get(validate(bookValidation.getBooks), bookController.getBooks);

router.route('/popular').get(bookController.getPopularBooks);
router
  .route('/:bookId/recommend')
  .get(validate(bookValidation.getRecommendBooksByBookId), bookController.getRecommedBooksByBookId);

router
  .route('/:bookId')
  .get(validate(bookValidation.getBook, bookValidation.getBook), bookController.getBook)
  .put(auth(roles.ADMIN, roles.MANAGER), upload.array(), validate(bookValidation.updateBook), bookController.updateBook)
  .delete(auth(roles.ADMIN, roles.MANAGER), validate(bookValidation.deleteBook), bookController.deleteBook);

router.route('/isbn/:isbn').get(validate(bookValidation.getBookByISBN), bookController.getBookByISBN);

router.route('/crawl').post(auth(roles.ADMIN), bookController.crawlBook);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book management and retrieval
 */

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a book
 *     description: Admins and Managers can create other books.
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - availableQuantity
 *               - isbn
 *               - language
 *               - totalPages
 *               - price
 *               - priceDiscount
 *               - publishedDate
 *               - publisherId
 *               - images
 *               - authors
 *               - genres
 *             properties:
 *               name:
 *                 type: string
 *               availableQuantity:
 *                 type: integer
 *               isbn:
 *                 type: string
 *               language:
 *                 type: string
 *               totalPages:
 *                 type: integer
 *               price:
 *                 type: integer
 *               priceDiscount:
 *                 type: integer
 *               description:
 *                 type: string
 *               publishedDate:
 *                 type: string
 *                 format: date
 *               publisherId:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                  type: string
 *                  format: binary
 *               authors:
 *                 type: array
 *                 items:
 *                  type: string
 *               genres:
 *                 type: array
 *                 items:
 *                  type: string
 *             example:
 *               name: Book 1
 *               availableQuantity: 10
 *               isbn: 1234567890123
 *               language: English
 *               totalPages: 100
 *               price: 10000
 *               priceDiscount: 10000
 *               description: Book description
 *               publishedDate: 2021-01-01
 *               publisherId: 5f0baba858c7ae3b946cde39
 *               images: book-image-1.jpg
 *               authors: ["5f0baba858c7ae3b946cde39", "5f0baba858c7ae3b946cde39"]
 *               genres: ["5f0baba858c7ae3b946cde39"]
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Book'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all books
 *     description: Anyone can retrieve all books.
 *     tags: [Books]
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
 *         description: Maximum number of books
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
 *                     $ref: '#/components/schemas/Book'
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
 * /books/{id}:
 *   get:
 *     summary: Get a book
 *     description: Anyone can retrieve a book.
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Book'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     summary: Update a book
 *     description: Admins and Managers can update other books.
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               availableQuantity:
 *                 type: integer
 *               isbn:
 *                 type: string
 *               language:
 *                 type: string
 *               totalPages:
 *                 type: integer
 *               price:
 *                 type: integer
 *               priceDiscount:
 *                 type: integer
 *               description:
 *                 type: string
 *               publishedDate:
 *                 type: string
 *                 format: date
 *               publisherId:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                  type: string
 *                  format: binary
 *               authors:
 *                 type: array
 *                 items:
 *                  type: string
 *               genres:
 *                 type: array
 *                 items:
 *                  type: string
 *             example:
 *               name: Book 1
 *               availableQuantity: 10
 *               isbn: 1234567890123
 *               language: English
 *               totalPages: 100
 *               price: 10000
 *               priceDiscount: 10000
 *               description: Book description
 *               publishedDate: 2021-01-01
 *               publisherId: 5f0baba858c7ae3b946cde39
 *               images: book-image-1.jpg
 *               authors: ["5f0baba858c7ae3b946cde39", "5f0baba858c7ae3b946cde39"]
 *               genres: ["5f0baba858c7ae3b946cde39"]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Book'
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
 *     summary: Delete a book
 *     description: Admins and Managers can delete other books.
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book id
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
