const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { profileService } = require('../services');

const createOrUpdateProfile = catchAsync(async (req, res) => {
  const profile = await profileService.createOrUpdateProfile(req.user.id, req.file, req.body);
  res.status(httpStatus.CREATED).send(profile);
});

const getProfileByUserId = catchAsync(async (req, res) => {
  const profile = await profileService.getProfileByUserId(req.user.id);
  res.send(profile);
});

const updatePassword = catchAsync(async (req, res) => {
  await profileService.updatePassword(req.user.id, req.body, res.io);

  res.send({ message: 'Password updated successfully' });
});

module.exports = {
  createOrUpdateProfile,
  getProfileByUserId,
  updatePassword,
};
