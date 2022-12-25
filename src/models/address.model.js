const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const addressSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  province: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Province',
    required: true,
  },
  city: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'City',
    required: true,
  },
  street: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
});

// add plugin that converts mongoose to json
addressSchema.plugin(toJSON);

/**
 * @typedef Address
 * @property {string} name
 * @property {string} description
 * @property {string} province
 * @property {string} district
 * @property {string} ward
 * @property {string} street
 * @property {string} phone
 * @property {boolean} isDefault
 * @property {ObjectId} user
 */

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
