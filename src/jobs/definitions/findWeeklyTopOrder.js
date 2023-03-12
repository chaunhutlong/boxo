/* eslint-disable no-console */

const { DateTime } = require('luxon');
const { Order, TopOrder } = require('../../models');

const findWeeklyTopOrder = async (agenda, logger) => {
  try {
    agenda.define('findWeeklyTopOrder', { priority: 'high', concurrency: 20 }, async function (job, done) {
      logger.info('findWeeklyTopOrder job started');
      const startOfWeek = DateTime.now().startOf('week').toJSDate();
      const endOfWeek = DateTime.now().endOf('week').toJSDate();

      // find the top order of this week
      Order.aggregate(
        [
          {
            $match: {
              createdAt: {
                $gte: startOfWeek,
                $lte: endOfWeek,
              },
            },
          },
          {
            $group: {
              _id: '$books',
              count: { $sum: 1 },
            },
          },
          {
            $sort: { count: -1 },
          },
          {
            $limit: 1,
          },
        ],
        (err, result) => {
          if (err) {
            console.error(err);
          } else {
            const topOrder = new TopOrder({
              book: result[0]._id,
              count: result[0].count,
              weekStartDate: startOfWeek,
              weekEndDate: endOfWeek,
            });

            topOrder.save((error) => {
              if (error) {
                console.error(error);
              }
            });
          }
        }
      );
      logger.info('findWeeklyTopOrder job finished');
      done();
    });
  } catch (error) {
    logger.error(error.message);
  }
};

module.exports = { findWeeklyTopOrder };
