const express = require('express');
const auth = require('../../middlewares/userAuth'); // Adjust path to your auth middleware
const {  userAuthController } = require('../../controllers');
const {userAuthValidation} = require('../../validations/index');
const validate = require('../../middlewares/validate');

const router = express.Router();

// All user routes require the user to be logged in
router.use(auth());

router
  .route('/profile').get(validate(userAuthValidation.getUser), userAuthController.getUser);
module.exports = router;