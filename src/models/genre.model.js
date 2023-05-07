const mongoose = require('mongoose');
const { toJSON, paginate, deleteRelatedDocuments } = require('./plugins');

const genreSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

genreSchema.plugin(toJSON);
genreSchema.plugin(paginate);

genreSchema.statics.isNameTaken = async function (name, excludeGenreId) {
  const genre = await this.findOne({ name, _id: { $ne: excludeGenreId } });
  return !!genre;
};

deleteRelatedDocuments(genreSchema, {
  relatedSchemasdeleteRelatedDocuments: [
    {
      modelName: 'Book',
      fieldName: 'genres',
    },
  ],
});

/**
 * @typedef Genre
 * @property {string} name
 * @property {string} description
 * @property {ObjectId} books
 */

const Genre = mongoose.model('Genre', genreSchema);

module.exports = Genre;
