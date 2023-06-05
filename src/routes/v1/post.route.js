const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const postValidation = require('../../validations/post.validation');
const postController = require('../../controllers/post.controller');
const { roles } = require('../../config/role.enum');

const router = express.Router();

router
  .route('/')
  .post(auth(roles.ADMIN, roles.MANAGER), validate(postValidation.createPost), postController.createPost)
  .get(validate(postValidation.getPosts), postController.getPosts);

router
  .route('/:postId')
  .get(validate(postValidation.getPost), postController.getPost)
  .put(auth(roles.ADMIN, roles.MANAGER), validate(postValidation.updatePost), postController.updatePost)
  .delete(auth(roles.ADMIN, roles.MANAGER), validate(postValidation.deletePost), postController.deletePost);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Post
 *   description: Post management and retrieval
 */
