const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const provinceSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

// add plugin that converts mongoose to json
provinceSchema.plugin(toJSON);

/**
 * @typedef Province
 * @property {string} name
 */

const Province = mongoose.model('Province', provinceSchema);

module.exports = Province;
