const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { userAuthService, tokenService } = require("../services");
const CONSTANT = require("../config/constant");
const { MailFunction } = require("../helpers");

// Reusable cookie options
const getCookieOptions = (expiresDate) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // must be true whenever sameSite is "none"
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  expires: new Date(expiresDate),
});

const createUser = catchAsync(async (req, res) => {
  const user = await userAuthService.registerUser(req.body);
  return res.send(user);
});

// Note: I changed COMPANY_NOT_FOUND to USER_NOT_FOUND to match your new context
const getUser = catchAsync(async (req, res) => {
  console.log("Fetching user with ID:", req.user.id); // Debugging log
  const userId = req.user.id;
  const user = await userAuthService.getUserById(userId); // Assuming you renamed this in service
  if (!user) {
    return res.send({
      data: {},
      code: CONSTANT.NOT_FOUND,
      message: CONSTANT.USER_NOT_FOUND,
    });
  }
  return res.send({
    data: user,
    code: CONSTANT.SUCCESSFUL,
    message: CONSTANT.USER_DETAILS,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userAuthService.updateUserById(
    req.user.id,
    req.body,
  );
  return res.send(user);
});


const login = catchAsync(async (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase();

  const user = await userAuthService.loginUserWithEmailAndPassword(
    email,
    password,
  );

  if (user && user.data && user.code == 200) {
    const tokens = await tokenService.generateAuthTokens(user.data);

    if (tokens) {
      // 1. Set the Refresh Token in an HTTP-Only Cookie
      res.cookie(
        "accessToken",
        tokens.access.token,
        getCookieOptions(tokens.access.expires),
      );
      res.cookie(
        "refreshToken",
        tokens.refresh.token,
        getCookieOptions(tokens.refresh.expires),
      );

      // 2. Remove refresh token from response body so frontend relies on cookie
      const responseTokens = { access: tokens.access };

      return res.send({
        data: { user: user.data, tokens: responseTokens },
        code: CONSTANT.SUCCESSFUL,
        message: CONSTANT.USER_DETAILS,
      });
    }
  }
  return res.send(user);
});

const logout = catchAsync(async (req, res) => {
  // 1. Read token from cookies instead of body
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await userAuthService.logout(refreshToken);
  }

  // 2. Clear the cookie in the browser
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  return res.send({
    data: {},
    code: CONSTANT.SUCCESSFUL,
    message: CONSTANT.Logout_MSG,
  });
});

const refreshTokens = catchAsync(async (req, res) => {
  // 1. Read token from cookies instead of body
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.send({
      data: {},
      code: CONSTANT.UNAUTHORIZED,
      message: "Refresh token not found in cookies",
    });
  }

  // 2. Generate new tokens
  const tokens = await userAuthService.refreshAuth(refreshToken);

  if (tokens && tokens.refresh) {
    // 3. Set the NEW refresh token in the cookie
    res.cookie(
      "accessToken",
      tokens.access.token,
      getCookieOptions(tokens.access.expires),
    );
    res.cookie(
      "refreshToken",
      tokens.refresh.token,
      getCookieOptions(tokens.refresh.expires),
    );

    // 4. Return only the new access token to the frontend
    return res.send({
      data: { access: tokens.access },
      code: CONSTANT.SUCCESSFUL,
      message: "Tokens refreshed",
    });
  }

  return res.send({
    data: {},
    code: CONSTANT.UNAUTHORIZED,
    message: "Session expired",
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const user = await userAuthService.validateUserWithEmail(req.body.email);
  if (user) {
    var resetPasswordToken =
      await tokenService.generateResetPasswordToken(user);
    await MailFunction.sendResetPasswordEmail(
      req.body.email,
      resetPasswordToken,
    );
    return res.send({
      data: {},
      code: CONSTANT.SUCCESSFUL,
      message: CONSTANT.FORGOT_PASSWORD,
    });
  } else {
    return res.send({
      data: {},
      code: CONSTANT.NOT_FOUND,
      message: CONSTANT.USER_NOT_FOUND,
    });
  }
});

const resetPassword = catchAsync(async (req, res) => {
  var response = await userAuthService.resetPassword(
    req.query.token,
    req.body.password,
  );
  return res.send(response);
});

const verifyEmail = catchAsync(async (req, res) => {
  var response = await userAuthService.verifyUserEmail(req.query.token);
  return res.send(response);
});

const resendEmailVerification = catchAsync(async (req, res) => {
  const email = req.body.email;
  const response = await userAuthService.resendUserEmailVerification(email);
  return res.send(response);
});

module.exports = {
  createUser,
  getUser,
  updateUser,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendEmailVerification,
};
