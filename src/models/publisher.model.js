const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const publisherSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
    maxLength: 12,

    validate: {
      validator: function (v) {
        return /^\d+$/.test(v);
      },
    },
  },
  email: {
    type: String,
  },
  description: {
    type: String,
  },
});

publisherSchema.plugin(toJSON);
publisherSchema.plugin(paginate);

publisherSchema.statics.isNameTaken = async function (name, excludePublisherId) {
  const publisher = await this.findOne({ name, _id: { $ne: excludePublisherId } });
  return !!publisher;
};

/**
 * @typedef Publisher
 */
const Publisher = mongoose.model('Publisher', publisherSchema);

module.exports = Publisher;
