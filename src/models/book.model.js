const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { paginate } = require('./plugins');

const bookSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    tags: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['Want to Read', 'Reading', 'Completed'],
      default: 'Want to Read',
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);
bookSchema.plugin(toJSON);
bookSchema.plugin(paginate)
const Book = mongoose.model('Book', bookSchema);
module.exports = Book;