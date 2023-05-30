const httpStatus = require('http-status');
const { Statistic } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Get statistics
 * @param {Object} filter - Mongo filter
 * @returns {Promise<Array>}
 */
const getStatistics = async (filter) => {
  const pipeline = [
    {
      $match: {
        createdAt: {
          $gte: new Date(filter.fromDate),
          $lte: new Date(filter.toDate),
        },
      },
    },
    {
      $group: {
        _id: {
          monthYear: { $dateToString: { format: '%m-%Y', date: '$createdAt' } },
        },
        totalOrder: { $sum: '$totalOrder' },
        totalRevenue: { $sum: '$totalRevenue' },
        totalSold: { $sum: '$totalSold' },
      },
    },
    {
      $project: {
        _id: 0,
        monthYear: '$_id.monthYear',
        totalOrder: 1,
        totalRevenue: 1,
        totalSold: 1,
      },
    },
  ];

  // Aggregate statistics
  const statistics = await Statistic.aggregate(pipeline);

  // Check if statistics is empty
  if (statistics.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Statistics not found');
  }

  return statistics;
};

module.exports = {
  getStatistics,
};
