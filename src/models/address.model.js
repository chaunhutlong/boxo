const mongoose = require('mongoose');
const { toJSON, deleteRelatedDocuments } = require('./plugins');

const addressSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  distance: {
    type: Number,
  },
  description: {
    type: String,
  },
  cityId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'City',
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
});

// add plugin that converts mongoose to json
addressSchema.plugin(toJSON);
addressSchema.plugin(deleteRelatedDocuments, {
  relatedModels: [
    {
      modelName: 'Shipping',
      fieldName: 'addressId',
    },
  ],
});

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
