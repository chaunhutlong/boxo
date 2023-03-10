const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const authorSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  biography: {
    type: String,
  },
  birthDate: {
    type: Date,
  },
  deathDate: {
    type: Date,
  },
});

// add plugin that converts mongoose to json
authorSchema.plugin(toJSON);
authorSchema.plugin(paginate);

/**
 * @typedef Author
 * @property {string} name
 * @property {string} biography
 * @property {Date} birthDate
 * @property {Date} deathDate
 * @property {ObjectId} books
 */

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;
