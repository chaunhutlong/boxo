const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { bookService } = require('../services');

const createBook = catchAsync(async (req, res) => {
  const { images, ...bookBody } = req.body;
  const book = await bookService.createBook(bookBody, images);
  res.status(httpStatus.CREATED).send(book);
});

const getBooks = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['query', 'search', 'authors', 'genres', 'publisher']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  options.populate = 'authors,genres,publisher';

  const result = await bookService.queryBooks(filter, options);
  res.send(result);
});

const getBook = catchAsync(async (req, res) => {
  const book = await bookService.getBookById(req.params.bookId);

  res.send(book);
});

const updateBook = catchAsync(async (req, res) => {
  const { images, ...bookBody } = req.body;
  const book = await bookService.updateBookById(req.params.bookId, bookBody, images);
  res.send(book);
});

const deleteBook = catchAsync(async (req, res) => {
  await bookService.deleteBookById(req.params.bookId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getBookByISBN = catchAsync(async (req, res) => {
  const book = await bookService.getBookByISBN(req.params.isbn);
  res.send(book);
});

const crawlBook = catchAsync(async (req, res) => {
  const book = await bookService.crawlBook(req.body);
  res.send(book);
});

module.exports = {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  getBookByISBN,
  crawlBook,
};
