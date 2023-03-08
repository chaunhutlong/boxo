const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const latDefault = 10.87;
const lngDefault = 106.8;

const citySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  provinceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Province',
  },
});

// add plugin that converts mongoose to json
citySchema.plugin(toJSON);

citySchema.statics.getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = this.deg2rad(lat2 - lat1); // deg2rad below
  const dLon = this.deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

citySchema.statics.getDistance = async (cityId) => {
  const city = await this.findById(cityId);
  const distance = await this.getDistanceFromLatLonInKm(latDefault, lngDefault, city.latitude, city.longitude);
  return distance;
};

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
