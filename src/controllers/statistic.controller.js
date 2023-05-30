const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { statisticService } = require('../services');

const getStatistics = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['fromDate', 'toDate']);
  const result = await statisticService.getStatistics(filter);
  res.send(result);
});

module.exports = {
  getStatistics,
};
