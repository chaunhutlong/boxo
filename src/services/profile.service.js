const httpStatus = require('http-status');
const { Profile, User } = require('../models');
const { getSignedUrl, deleteFileFromS3 } = require('../utils/s3');
const ApiError = require('../utils/ApiError');

const BUCKET = process.env.AWS_S3_AVATAR_BUCKET;
/**
 * Create a profile
 * @param {Object} profileBody
 * @param {ObjectId} userId
 * @returns {Promise<Profile>}
 */
const createOrUpdateProfile = async (userId, avatar, profileBody) => {
  try {
    const profile = await Profile.findOne({ userId });
    if (profile) {
      Object.assign(profile, profileBody);
      // TODO: remove old avatar from s3
      if (avatar) {
        await deleteFileFromS3(BUCKET, profile.avatar);
        profile.avatar = avatar.key;
      }

      await profile.save();
      return profile;
    }
    const newProfile = await Profile.create({
      ...profileBody,
      userId,
      avatar: avatar ? avatar.key : null,
    });

    return newProfile;
  } catch (error) {
    if (avatar) {
      await deleteFileFromS3(BUCKET, avatar.key);
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};
/**
 * Get profile by userId
 * @param {ObjectId} id
 * @returns {Promise<Profile>}
 */
const getProfileByUserId = async (userId) => {
  const profile = await Profile.findOne({ userId }).populate('user');
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  // TODO: get signed url for avatar
  if (profile.avatar) {
    profile.avatar = getSignedUrl(BUCKET, profile.avatar);
  }

  return profile;
};

/**
 * Update user password
 * @param {ObjectId} userId
 * @param {string} body
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
