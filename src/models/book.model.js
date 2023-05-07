const mongoose = require('mongoose');
const { softDeletePlugin } = require('soft-delete-plugin-mongoose');
const { toJSON, paginateBook, deleteRelatedDocuments } = require('./plugins');

const imageSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
  },
  {
    _id: false,
  }
);

const bookSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    isbn: {
      type: String,
      required: true,
      max: 13,
      index: true,
      unique: true,
    },
    language: {
      type: String,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    priceDiscount: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
    },
    publishedDate: {
      type: Date,
      required: true,
    },
    publisherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publisher',
      required: true,
    },
    imageCover: {
      type: imageSchema,
    },
    images: [imageSchema],
    authors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author',
      },
    ],
    genres: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre',
      },
    ],
    discounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discount',
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
    hasDiscount: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

bookSchema.plugin(toJSON);
bookSchema.plugin(paginateBook);
bookSchema.plugin(softDeletePlugin);

bookSchema.statics.isNameTaken = async function (name, excludeBookId) {
  const book = await this.findOne({ name, _id: { $ne: excludeBookId } });
  return !!book;
};

deleteRelatedDocuments(bookSchema, {
  relatedSchemas: [
    {
      modelName: 'Review',
      fieldName: 'book',
    },
    {
      modelName: 'Discount',
      fieldName: 'books',
    },
  ],
});

/**
 * @typedef Book
 * @property {string} name
 * @property {number} availableQuantity
 * @property {string} isbn
 * @property {string} language
 * @property {number} totalPages
 * @property {number} price
 * @property {number} priceDiscount
 * @property {string} description
 * @property {Date} publishedDate
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {Date} deletedAt
//  */

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
