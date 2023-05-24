/* eslint-disable no-console */

// const { findWeeklyTopOrder } = require('./findWeeklyTopOrder');
const { statisticsDaily } = require('./statisticsDaily');


const definitions = [ statisticsDaily];

const allDefinition = async (agenda, logger) => {
  try {
    const results = [];
    Object.values(definitions).forEach((definition) => {
      results.push(definition(agenda, logger));
    });

    await Promise.all(results);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  allDefinition,
};
