const express = require('express');
const auth = require('../../middlewares/userAuth'); // Adjust path to your auth middleware
const { bookController } = require('../../controllers');
const {bookValidation} = require('../../validations/index');
const validate = require('../../middlewares/validate');

const router = express.Router();

// All book routes require the user to be logged in
router.use(auth());

router
  .route('/')
  .post(validate(bookValidation.createBook), bookController.createBook)
  .get(validate(bookValidation.getBooks), bookController.getBooks);

router
  .route('/:bookId')
  .patch(validate(bookValidation.updateBook), bookController.updateBook)
  .delete(validate(bookValidation.deleteBook), bookController.deleteBook);

module.exports = router;