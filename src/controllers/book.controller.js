const catchAsync = require('../utils/catchAsync');
const { bookService } = require('../services');

const createBook = catchAsync(async (req, res) => {
  // req.user.id is populated by your authentication middleware
  const response = await bookService.addBook(req.user.id, req.body);
  return res.send(response);
});

const getBooks = catchAsync(async (req, res) => {
  console.log("Query Parameters:", req.query); // Log the query parameters for debugging
  // 1. Extract pagination options
  const options = {
    limit: req.query.limit,
    page: req.query.page,
    sortBy: req.query.sortBy,
  };

  // 2. Extract database filters
  const filter = {
    status: req.query.status,
    tag: req.query.tag
  };

  // Remove undefined filters so MongoDB doesn't search for "undefined"
  Object.keys(filter).forEach(key => filter[key] === undefined && delete filter[key]);

  const response = await bookService.getBooks(req.user.id, filter, options);
  return res.send(response);
});

const updateBook = catchAsync(async (req, res) => {
  const response = await bookService.updateBook(req.user.id, req.params.bookId, req.body);
  return res.send(response);
});

const deleteBook = catchAsync(async (req, res) => {
  const response = await bookService.deleteBook(req.user.id, req.params.bookId);
  return res.send(response);
});

module.exports = {
  createBook,
  getBooks,
  updateBook,
  deleteBook,
};