const httpStatus = require('http-status');
const { Profile, User } = require('../models');
const { deleteFilesFromS3 } = require('../utils/s3');
const ApiError = require('../utils/ApiError');
const { bucket } = require('../config/s3.enum');

/**
 * Create a profile
 * @param {Object} profileBody
 * @param {ObjectId} userId
 * @param avatar
 * @returns {Promise<Profile>}
 */
const createOrUpdateProfile = async (userId, avatar, profileBody) => {
  try {
    const profile = await Profile.findOne({ userId });

    if (profile) {
      Object.assign(profile, profileBody);

      if (avatar) {
        await deleteFilesFromS3(bucket.AVATAR, profile.avatarKey);
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

    return await Profile.create({ ...profileBody, userId });
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
  const profile = await Profile.findOne({ userId }).populate('user');
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  return profile;
};

/**
 * Update user password
 * @param {ObjectId} userId
 * @param {Object} body
 * @returns {Promise<User>}
 */
const updatePassword = async (userId, body) => {
  const user = await User.findById(userId);

  if (!(await user.isPasswordMatch(body.oldPassword))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password does not match');
  }

  user.password = body.newPassword;
  await user.save();
};

module.exports = {
  createOrUpdateProfile,
  getProfileByUserId,
  updatePassword,
};
