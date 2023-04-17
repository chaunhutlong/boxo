const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const postValidation = require('../../validations/post.validation');
const postController = require('../../controllers/post.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(postValidation.createPost), postController.createPost)
  .get(validate(postValidation.getPosts), postController.getPosts);

router
  .route('/:postId')
  .get(validate(postValidation.getPost), postController.getPost)
  .put(auth(), validate(postValidation.updatePost), postController.updatePost);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Post
 *   description: Post management and retrieval
 */
