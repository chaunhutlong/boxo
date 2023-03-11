const { DateTime } = require('luxon');
const { Order } = require('../../models');

const findWeeklyTopOrder = async (agenda, logger) => {
  try {
    agenda.define('findWeeklyTopOrder', { priority: 'high', concurrency: 20 }, async function (job, done) {
      try {
        const { io } = agenda;
        const { weekStart, weekEnd } = DateTime.local().startOf('week').toObject();

        const orders = await Order.find({ createdAt: { $gte: weekStart, $lte: weekEnd } })
          .populate('user')
          .populate('product')
          .sort({ quantity: -1 })
          .limit(10);

        io.emit('weeklyTopOrder', orders);
        logger.info('Weekly top order sent');
        done();
      } catch (error) {
        logger.error(error);
        done(error);
      }
    });
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { findWeeklyTopOrder };
