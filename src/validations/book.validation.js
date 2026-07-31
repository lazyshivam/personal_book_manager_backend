const Joi = require('joi');

// Custom validation to ensure IDs passed in params are valid MongoDB ObjectIds
const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const createBook = {
  body: Joi.object().keys({
    title: Joi.string().required().messages({
      'any.required': 'Book title is required',
    }),
    author: Joi.string().required().messages({
      'any.required': 'Author name is required',
    }),
    tags: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid('Want to Read', 'Reading', 'Completed').optional(),
  }),
};

const getBooks = {
  query: Joi.object().keys({
    status: Joi.string().valid('Want to Read', 'Reading', 'Completed').optional(),
    tag: Joi.string().optional(),
    limit: Joi.number().integer().min(1).optional(),
    page: Joi.number().integer().min(1).optional(),
    sortBy: Joi.string().optional(),
  }),
};

const updateBook = {
  params: Joi.object().keys({
    bookId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string(),
      author: Joi.string(),
      tags: Joi.array().items(Joi.string()),
      status: Joi.string().valid('Want to Read', 'Reading', 'Completed'),
    })
    .min(1), // Ensures at least one field is provided for the update
};

const deleteBook = {
  params: Joi.object().keys({
    bookId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  createBook,
  getBooks,
  updateBook,
  deleteBook,
};