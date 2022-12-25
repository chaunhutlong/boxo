const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

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
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    },
  ],
});

// add plugin that converts mongoose to json
authorSchema.plugin(toJSON);

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
