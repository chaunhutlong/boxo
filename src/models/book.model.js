const mongoose = require('mongoose');
const { softDeletePlugin } = require('soft-delete-plugin-mongoose');
const { toJSON, paginateBook } = require('./plugins');

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
      index: true,
      max: 13,
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
      validate: {
        validator: (v) => v <= this.price,

        message: (props) => `${props.value} is not less than or equal to ${this.price}`,
      },
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
      type: mongoose.Schema.Types.ObjectId,
    },
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookImage',
      },
    ],
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
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
 * @property {boolean} isDeleted
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {Date} deletedAt
//  */

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
