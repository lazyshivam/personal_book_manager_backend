const { BookModel } = require("../models");
const CONSTANT = require("../config/constant");

/**
 * Add a new book
 */
const addBook = async (userId, bookBody) => {
  const book = await BookModel.create({ ...bookBody, user: userId });
  return { data: book, code: 200, message: CONSTANT.BOOK_ADDED  };
};

/**
 * Get all books for a user with pagination
 */
const getBooks = async (userId, filter, options) => {
  
  const totalCollectionCount = await BookModel.countDocuments({ user: userId });

  filter.user = userId;

  if (filter.tag) {
    filter.tags = { $regex: filter.tag, $options: "i" };
    delete filter.tag;
  }

 
  const paginatedData = await BookModel.paginate(filter, options);

  return { 
    data: {
      ...paginatedData,
      totalCollectionCount 
    }, 
    code: 200, 
    message: CONSTANT.BOOK_RETRIEVED 
  };
};



/**
 * Update a book (e.g., mark as read)
 */
const updateBook = async (userId, bookId, updateBody) => {
  // Ensure the user actually owns this book
  const book = await BookModel.findOne({ _id: bookId, user: userId });
  
  if (!book) {
    return { data: {}, code: 404, message: CONSTANT.BOOK_NOT_FOUND };
  }

  Object.assign(book, updateBody);
  await book.save();
  
  return { data: book, code: 200, message: CONSTANT.BOOK_UPDATED };
};

/**
 * Delete a book
 */
const deleteBook = async (userId, bookId) => {
  const book = await BookModel.findOneAndDelete({ _id: bookId, user: userId });
  
  if (!book) {
    return { data: {}, code: 404, message: CONSTANT.BOOK_NOT_FOUND };
  }

  return { data: {}, code: 200, message: CONSTANT.BOOK_DELETED };
};

module.exports = {
  addBook,
  getBooks,
  updateBook,
  deleteBook,
};