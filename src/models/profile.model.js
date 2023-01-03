const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const profileSchema = mongoose.Schema({
  biography: {
    type: String,
  },
  avatar: {
    type: String,
  },
  addresses: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Address',
    },
  ],
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  discounts: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Discount',
    },
  ],
});

profileSchema.plugin(toJSON);

/**
 * @typedef Profile
 * @property {string} name
 * @property {string} biography
 * @property {string} avatar
 * @property {ObjectId} user
 * @property {ObjectId[]} addresses
 */

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
