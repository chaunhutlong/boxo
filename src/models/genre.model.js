const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

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

genreSchema.plugin(toJSON);
genreSchema.plugin(paginate);

/**
 * @typedef Genre
 * @property {string} name
 * @property {string} description
 * @property {ObjectId} books
 */

const Genre = mongoose.model('Genre', genreSchema);

module.exports = Genre;
