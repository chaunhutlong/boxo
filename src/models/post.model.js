const mongoose = require('mongoose');
const { paginate } = require('./plugins');

const postSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    images: [
      {
        key: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

postSchema.plugin(paginate);

/**
 * @typedef Post
 * @property {string} title
 * @property {string} content
 * @property {ObjectId} author
 * @property {Array} images
 * @property {string} images.key
 * @property {string} images.url
 */

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
