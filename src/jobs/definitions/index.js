/* eslint-disable no-console */

const { findWeeklyTopOrder } = require('./findWeeklyTopOrder');

const definitions = [findWeeklyTopOrder];

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
