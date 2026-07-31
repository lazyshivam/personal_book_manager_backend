const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const validate = require('../../middlewares/validate');
const {userAuthValidation:userValidation} = require('../../validations/index');
const { userAuthController } = require('../../controllers')

const router = express.Router();

// router.route('/change-password').post(companyAuth('getUsersWithoutPagination'), userController.changePassword);

router.post('/auth/register', validate(userValidation.registerUser), userAuthController.createUser);
router.post('/auth/login', validate(userValidation.login), userAuthController.login);

router.post('/auth/logout', validate(userValidation.logout), userAuthController.logout);
router.post('/auth/refresh-tokens', validate(userValidation.refreshTokens), userAuthController.refreshTokens);
router.post('/auth/forgot-password', validate(userValidation.forgotPassword), userAuthController.forgotPassword);
router.post('/auth/reset-password', validate(userValidation.resetPassword), userAuthController.resetPassword);
router.get('/auth/verify',validate(userValidation.verifyEmail),userAuthController.verifyEmail);
router.post('/auth/resend-emailVerification', userAuthController.resendEmailVerification);

module.exports = router;