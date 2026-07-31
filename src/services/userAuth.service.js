const { UserModel, CreditAPIHitModel } = require("../models");
const CONSTANT = require("../config/constant");
const Token = require("../models/token.model");
const { tokenTypes } = require("../config/tokens");
const tokenService = require("./token.service");
const bcrypt = require("bcryptjs");
const mailFunctions = require("../helpers/mailFunctions");
const jwt = require('jsonwebtoken');

/**
 * Create a User
 * @param {Object} userBody
 * @returns {Promise<Object>}
 */
const registerUser = async (userBody) => {
  if (await UserModel.isEmailTaken(userBody.email)) {
    return { data: {}, code: CONSTANT.BAD_REQUEST, message: CONSTANT.USER_EMAIL_ALREADY_EXISTS };
  }

  const user = await UserModel.create(userBody);
  
  // UNCOMMENT THESE WHEN READY TO TEST EMAILS:
  // const token = await tokenService.generateEmailVerificationToken(user);
  // await mailFunctions.sendVerificationEmail(user, token);
  
  return { data: user, code: 200, message: CONSTANT.USER_CREATE };
};

const validateUserWithEmail = async (email) => {
  var details = await UserModel.findOne({ email });
  return details;
};

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  var details = await UserModel.findOne({ email });
  if (!details || !(await details.isPasswordMatch(password))) {
    return { data: {}, code: CONSTANT.UNAUTHORIZED, message: CONSTANT.UNAUTHORIZED_MSG };
  }

  // UNCOMMENT THIS WHEN READY TO ENFORCE EMAIL VERIFICATION:
  // if (!details.emailVerificationStatus) {
  //   return { data: {}, code: CONSTANT.BAD_REQUEST, message: CONSTANT.VERIFICATION_REQUIRED_MSG };
  // }
  
  return { data: details, code: CONSTANT.SUCCESSFUL, message: CONSTANT.USER_DETAILS };
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });

  if (!refreshTokenDoc) {
    return { data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG };
  }
  
  await refreshTokenDoc.deleteOne();
  
  // ADDED: Return a success response so the controller can send it to the client
  return { data: {}, code: CONSTANT.SUCCESSFUL, message: CONSTANT.Logout_MSG || "Logout successful" };
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  console.log("Fetching user by ID:", id); // DEBUG: Log the ID being fetched
  return UserModel.findById(id);
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    
    await refreshTokenDoc.deleteOne();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    return { data: {}, code: CONSTANT.UNAUTHORIZED, message: CONSTANT.UNAUTHORIZED_MSG };
  }
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<Object>}
 */
const updateUserById = async (userId, updateBody) => {
  try {
    const user = await getUserById(userId);
    if (!user) {
      return { data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.USER_NOT_FOUND };
    }
    
    updateBody.updatedAt = new Date();
    Object.assign(user, updateBody);
    await user.save();
    return { data: user, code: CONSTANT.SUCCESSFUL, message: CONSTANT.USER_UPDATE };
  } catch (error) {
    console.error("Update User Error:", error);
    // FIXED: Return an error object instead of leaving the client hanging
    return { data: {}, code: CONSTANT.INTERNAL_SERVER_ERROR, message: "Failed to update user." };
  }
};


/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise<Object>}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      tokenTypes.RESET_PASSWORD
    );
    
    await updateUserById(resetPasswordTokenDoc.user, { password: newPassword });
    await Token.deleteMany({ user: resetPasswordTokenDoc.user, type: tokenTypes.RESET_PASSWORD });

    return { data: {}, code: CONSTANT.SUCCESSFUL, message: "Password updated successfully" };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { data: {}, code: CONSTANT.UNAUTHORIZED, message: "Reset token expired. Please request a new password reset link." };
    } else if (error instanceof jwt.JsonWebTokenError) {
      return { data: {}, code: CONSTANT.UNAUTHORIZED, message: "Invalid reset token. Please make sure you're using the correct link." };
    } else {
      console.error(error);
      return { data: {}, code: CONSTANT.INTERNAL_SERVER_ERROR, message: "Internal server error. Please try again later." };
    }
  }
};

/**
 * Verification of user email
 */
const verifyUserEmail = async (verifyToken) => {
  try {
    const verificationTokenDoc = await tokenService.verifyToken(
      verifyToken,
      tokenTypes.EMAIL_VERIFICATION
    );
    
    await tokenService.deleteToken(verifyToken, tokenTypes.EMAIL_VERIFICATION);
    await updateUserById(verificationTokenDoc.user, { emailVerificationStatus: true });
    return { data: {}, code: CONSTANT.SUCCESSFUL, message: "Email verified successfully" };

  } catch (error) {
    return { data: {}, code: CONSTANT.BAD_REQUEST, message: "Email verification failed" };
  }
};

/**
 * Resend verification of user email
 */
const resendUserEmailVerification = async (userEmail) => {
  const user = await UserModel.findOne({ email: userEmail });
  
  // FIXED: Ensure the user actually exists before generating a token to prevent app crashes
  if (!user) {
    return { data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.USER_NOT_FOUND || "User not found" };
  }
  
  const token = await tokenService.generateEmailVerificationToken(user);
  await mailFunctions.sendVerificationEmail(user, token);
  return { data: [], code: 200, message: CONSTANT.EMAIL_VERIFICATION || "Verification email sent" };
};

module.exports = {
  registerUser,
  loginUserWithEmailAndPassword,
  logout,
  getUserById,
  updateUserById,
  validateUserWithEmail,
  refreshAuth,
  resetPassword,
  verifyUserEmail,
  resendUserEmailVerification,
};