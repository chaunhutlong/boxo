const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const provinceSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  cities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
    },
  ],
});

// add plugin that converts mongoose to json
provinceSchema.plugin(toJSON);

/**
 * @typedef Province
 * @property {string} name
 * @property {string} description
 * @property {ObjectId} cities
 */

const Province = mongoose.model('Province', provinceSchema);

module.exports = Province;
