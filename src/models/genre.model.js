const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const genreSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    },
  ],
});

// add plugin that converts mongoose to json
genreSchema.plugin(toJSON);

/**
 * @typedef Genre
 * @property {string} name
 * @property {string} description
 * @property {ObjectId} books
 */

const Genre = mongoose.model('Genre', genreSchema);

module.exports = Genre;
