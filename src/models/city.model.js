const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const citySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  province: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Province',
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
});

// add plugin that converts mongoose to json
citySchema.plugin(toJSON);

/**
 * @typedef City
 * @property {string} name
 * @property {string} description
 * @property {ObjectId} province
 * @property {number} latitude
 * @property {number} longitude
 */

const City = mongoose.model('City', citySchema);

module.exports = City;
