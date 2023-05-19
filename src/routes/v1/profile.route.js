const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const profileValidation = require('../../validations/profile.validation');
const profileController = require('../../controllers/profile.controller');
const { uploadFileToS3 } = require('../../utils/s3');
const { bucket } = require('../../config/s3.enum');

const router = express.Router();

router
  .route('/')
  .post(
    auth(),
    uploadFileToS3(bucket.AVATAR).single('avatar'),
    validate(profileValidation.createOrUpdateProfile),
    profileController.createOrUpdateProfile
  )
  .get(auth(), profileController.getProfileByUserId);

router.put('/password', auth(), validate(profileValidation.updatePassword), profileController.updatePassword);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Profile management and retrieval
 */

/**
 * @swagger
 * /profile:
 *   post:
 *     summary: Create or update a profile
 *     description: Anyone can create or update a profile.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               biography:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *             example:
 *               biography: I am a software engineer
 *               avatar: https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Profile'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get user's profile
 *     description: Anyone can retrieve a profile.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /profile/password:
 *    put:
 *      summary: Update user's password
 *      description: Only authenticated users can update their password.
 *      tags: [Profile]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - oldPassword
 *                - newPassword
 *              properties:
 *                oldPassword:
 *                  type: string
 *                  format: password
 *                  description: The old password
 *                newPassword:
 *                  type: string
 *                  format: password
 *                  description: The new password
 *              example:
 *                oldPassword: thisIsMyOldPassword
 *                newPassword: thisIsMyNewPassword
 *      responses:
 *        "200":
 *            description: OK
 *            content:
 *               application/json:
 *                schema:
 *                 type: string
 *                 example: Password updated successfully
 *        "400":
 *          $ref: '#/components/responses/BadRequest'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *        "500":
 *          $ref: '#/components/responses/InternalServerError'
 */
