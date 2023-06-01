const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const statisticSchema = mongoose.Schema(
  {
    orderDate: {
      type: Date,
      required: true,
    },
    totalOrder: {
      type: Number,
      required: true,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      required: true,
      default: 0,
    },
    totalSold: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
statisticSchema.plugin(toJSON);
statisticSchema.plugin(paginate);

/**
 * @typedef Statistic
 * @property {Date} orderDate
 * @property {number} totalOrder
 * @property {number} totalRevenue
 * @property {number} totalSold
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const Statistic = mongoose.model('Statistic', statisticSchema);

module.exports = Statistic;
