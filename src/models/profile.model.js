const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const profileSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
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
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  discount: [
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
