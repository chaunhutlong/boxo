const Joi = require('joi');
const { password, objectId } = require('./custom.validation');
let { roles } = require('../config/role.enum');

roles = Object.values(roles).filter((role) => role !== 'admin');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string()
      .required()
      .valid(...roles),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const activateUserByUserId = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const deactivateUserByUserId = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const assignRoleToUser = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    role: Joi.string()
      .required()
      .valid(...roles),
  }),
};

const removeRoleFromUser = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    role: Joi.string()
      .required()
      .valid(...roles),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  activateUserByUserId,
  deactivateUserByUserId,
  assignRoleToUser,
  removeRoleFromUser,
};
