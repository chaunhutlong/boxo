const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { genreService } = require('../services');

const createGenre = catchAsync(async (req, res) => {
  const genre = await genreService.createGenre(req.body);
  res.status(httpStatus.CREATED).send(genre);
});

const getGenres = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await genreService.queryGenres(filter, options);
  res.send(result);
});

const getGenre = catchAsync(async (req, res) => {
  const genre = await genreService.getGenreById(req.params.genreId);

  res.send(genre);
});

const updateGenre = catchAsync(async (req, res) => {
  const genre = await genreService.updateGenreById(req.params.genreId, req.body);
  res.send(genre);
});

const deleteGenre = catchAsync(async (req, res) => {
  await genreService.deleteGenreById(req.params.genreId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createGenre,
  getGenres,
  getGenre,
  updateGenre,
  deleteGenre,
};
