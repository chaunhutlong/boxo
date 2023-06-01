const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { roles } = require('../config/role.enum');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  return User.paginate(filter, options);
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);

  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);

  await user.remove();
  return user;
};

/**
 * Activate a user by userId
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const activateUserByUserId = async (userId) => {
  const user = await getUserById(userId);

  user.isActive = true;
  await user.save();
  return user;
};

/**
 * Deactivate a user by userId
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deactivateUserByUserId = async (userId) => {
  const user = await getUserById(userId);

  user.isActive = false;
  await user.save();
  return user;
};

const assignRoleToUser = async (userId, role) => {
  const user = await getUserById(userId);

  if (role === roles.ADMIN) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Not allow to assign admin role to user');
  }

  if (user.roles.includes(role)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already has role');
  }

  user.roles = [...user.roles, role];
  await user.save();
  return user;
};

const removeRoleFromUser = async (userId, role) => {
  const user = await getUserById(userId);

  if (role === roles.ADMIN) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Not allow to remove admin role from user');
  }

  user.roles = user.roles.filter((r) => r !== role);

  await user.save();
  return user;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  activateUserByUserId,
  deactivateUserByUserId,
  assignRoleToUser,
  removeRoleFromUser,
};
