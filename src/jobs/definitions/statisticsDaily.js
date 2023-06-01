const DateTime = require('luxon').DateTime;
const { Order, Statistic } = require('../../models');

const statisticsDaily = async (agenda, logger) => {
    try {
        agenda.define('statisticsDaily', { priority: 'high'}, async function (job, done) {
        logger.info('statisticsDaily job started');
        const today = DateTime.now().toJSDate();
        const startOfDay = DateTime.now().startOf('day').toISO();
        const endOfDay = DateTime.now().endOf('day').toISO();
        Order.find(
            {
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
            },
            (err, orders) => {
            if (err) {
                console.error(err);
            } else {
                let totalOrder = 0;
                let totalRevenue = 0;
                let totalSold = 0;
    
                orders.forEach((order) => {
                totalOrder += 1;
                totalRevenue += order.totalPayment;
                order.books.forEach((book) => {
                    totalSold += book.quantity;
                });
                });
    
                const statistic = new Statistic({
                orderDate: today,
                totalOrder: totalOrder,
                totalRevenue: totalRevenue,
                totalSold: totalSold,
                });
    
                statistic.save((error) => {
                if (error) {
                    console.error(error);
                }
                });
            }
            }
        );
        logger.info('statisticsDaily job finished');
        done();
        });
    } catch (error) {
        logger.error(error.message);
    }
};

module.exports = {statisticsDaily};
