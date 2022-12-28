const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const bookValidation = require('../../validations/book.validation');
const bookController = require('../../controllers/book.controller');
const { roles } = require('../../config/role.enum');
const { uploadFileToS3 } = require('../../utils/s3');

const router = express.Router();

// S3 BUCKET NAME
const BUCKET_NAME = process.env.AWS_S3_BOOK_IMAGE_BUCKET || 'book-image';

router
  .route('/')
  .post(
    auth(roles.ADMIN, roles.MANAGER),
    uploadFileToS3(BUCKET_NAME).array('image'),
    validate(bookValidation.createBook),
    bookController.createBook
  )
  .get(validate(bookValidation.getBooks), bookController.getBooks);

router
  .route('/:bookId')
  .get(validate(bookValidation.getBook), bookController.getBook)
  .put(
    auth(roles.ADMIN, roles.MANAGER),
    uploadFileToS3(BUCKET_NAME).array('image'),
    validate(bookValidation.updateBook),
    bookController.updateBook
  )
  .delete(auth(roles.ADMIN, roles.MANAGER), validate(bookValidation.deleteBook), bookController.deleteBook);

module.exports = router;
