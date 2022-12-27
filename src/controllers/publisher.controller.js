const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { publisherService } = require('../services');

const createPublisher = catchAsync(async (req, res) => {
  const publisher = await publisherService.createPublisher(req.body);
  res.status(httpStatus.CREATED).send(publisher);
});

const getPublishers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await publisherService.queryPublishers(filter, options);
  res.send(result);
});

const getPublisher = catchAsync(async (req, res) => {
  const publisher = await publisherService.getPublisherById(req.params.publisherId);

  res.send(publisher);
});

const updatePublisher = catchAsync(async (req, res) => {
  const publisher = await publisherService.updatePublisherById(req.params.publisherId, req.body);
  res.send(publisher);
});

const deletePublisher = catchAsync(async (req, res) => {
  await publisherService.deletePublisherById(req.params.publisherId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createPublisher,
  getPublishers,
  getPublisher,
  updatePublisher,
  deletePublisher,
};
