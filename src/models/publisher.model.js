const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const publisherSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  description: {
    type: String,
  },
});

// add plugin that converts mongoose to json
publisherSchema.plugin(toJSON);

/**
 * @typedef Publisher
 * @property {string} name
 * @property {string} address
 * @property {string} phone
 * @property {string} email
 * @property {string} description
 */

const Publisher = mongoose.model('Publisher', publisherSchema);

module.exports = Publisher;
