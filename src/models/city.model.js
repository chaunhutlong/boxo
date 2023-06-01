const fetch = require('node-fetch');
const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const latDefault = 10.87;
const lngDefault = 106.8;

const citySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  province: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Province',
  },
});

// add plugin that converts mongoose to json
citySchema.plugin(toJSON);

citySchema.statics.deg2rad = function (deg) {
  return deg * (Math.PI / 180);
};

citySchema.statics.getDistanceFromLatLonInKm = async function (lat1, lon1, lat2, lon2) {
  const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.routes[0].distance / 1000;
};

citySchema.statics.getDistance = async function (cityId) {
  const city = await this.findById(cityId);
  return this.getDistanceFromLatLonInKm(latDefault, lngDefault, city.lat, city.lng);
};

/**
 * @typedef City
 * @property {string} name
 * @property {number} lat
 * @property {number} lng
 * @property {ObjectId} provinceId
 */

const City = mongoose.model('City', citySchema);

module.exports = City;
