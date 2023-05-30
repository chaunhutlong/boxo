const Joi = require('joi');

const getStatistics = {
  query: Joi.object().keys({
    fromDate: Joi.date().required(),
    toDate: Joi.date().required(),
  }),
};

module.exports = {
  getStatistics,
};
