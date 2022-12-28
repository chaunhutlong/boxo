const Joi = require('joi');

const createOrUpdateProfile = {
  body: Joi.object().keys({
    biography: Joi.string().allow(null, ''),
    avatar: Joi.string().allow(null, ''),
  }),
};

const updatePassword = {
  body: Joi.object().keys({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required().min(6),
  }),
};

module.exports = {
  createOrUpdateProfile,
  updatePassword,
};
