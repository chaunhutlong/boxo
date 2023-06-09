const httpStatus = require('http-status');
const { Profile, User } = require('../models');
const { deleteFilesFromS3 } = require('../utils/s3');
const ApiError = require('../utils/ApiError');
const { createNotification } = require('./notification.service');
const { bucket } = require('../config/s3.enum');
const { notificationTypes } = require('../config/notification.enum');

/**
 * Create a profile
 * @param {Object} profileBody
 * @param {ObjectId} userId
 * @param avatar
 * @returns {Promise<Profile>}
 */
const createOrUpdateProfile = async (userId, avatar, profileBody) => {
  try {
    const profile = await Profile.findOne({ user: userId });

    if (profile) {
      Object.assign(profile, profileBody);

      if (avatar) {
        if (profile.avatarKey) {
          await deleteFilesFromS3(bucket.AVATAR, profile.avatarKey);
        }
        profile.avatar = avatar.location;
        profile.avatarKey = avatar.key;
      }

      await profile.save();
      return profile;
    }

    if (avatar && avatar.location && avatar.location.startsWith('https://')) {
      profileBody.avatar = avatar.location;
      profileBody.avatarKey = avatar.key;
    } else if (avatar) {
      const keyIndex = avatar.lastIndexOf('/');
      profileBody.avatar = avatar;
      profileBody.avatarKey = avatar.substring(keyIndex + 1);
    }

    return await Profile.create({ ...profileBody, user: userId });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * Get profile by userId
 * @returns {Promise<Profile>}
 * @param userId
 */
const getProfileByUserId = async (userId) => {
  const profile = await Profile.findOne({ user: userId }).populate('user');
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  return profile;
};

/**
 * Update user password
 * @param {ObjectId} userId
 * @param {Object} body
 * @param {Object} socket
 * @returns {Promise<User>}
 */
const updatePassword = async (userId, body, socket) => {
  const user = await User.findById(userId);

  if (!(await user.isPasswordMatch(body.oldPassword))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password does not match');
  }

  user.password = body.newPassword;
  // if change password successfully, notify to user
  const bodyNotification = {
    title: 'Change password',
    content: 'Your password has been changed. Please login again',
    type: notificationTypes.USER,
    user: userId,
  };
  await createNotification(bodyNotification);
  socket.to(userId).emit('notification', { message: 'Your password has been changed. Please login again' });
  await user.save();
};

module.exports = {
  createOrUpdateProfile,
  getProfileByUserId,
  updatePassword,
};
