const jwt = require('jsonwebtoken');
const config = require('../config/config');
const CONSTANT = require('../config/constant');
const { UserModel } = require('../models');

const userAuth = () => async (req, res, next) => {
  try {
    // 1. Try to get the token from HTTP-Only cookies first (Next.js flow)
    let token = req.cookies && req.cookies.accessToken;

    // 2. Fallback to Authorization header (Useful for Postman/Swagger testing)
    if (!token) {
      const bearerHeader = req.headers["authorization"];
      if (bearerHeader && bearerHeader.startsWith("Bearer ")) {
        token = bearerHeader.split(" ")[1];
      }
    }

    // 3. If no token is found in either place, deny access
    if (!token) {
      return res.status(CONSTANT.UNAUTHORIZED).json({ 
        code: CONSTANT.UNAUTHORIZED, 
        message: CONSTANT.NO_TOKEN || "No token provided" 
      });
    }

    // 4. Verify the token
    jwt.verify(token, config.jwt.secret, async (error, decoded) => {
      
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(CONSTANT.UNAUTHORIZED).json({ 
          data: {}, code: CONSTANT.UNAUTHORIZED, message: "Session expired. Please login again." 
        });
      } else if (error instanceof jwt.JsonWebTokenError || error) {
        return res.status(CONSTANT.UNAUTHORIZED).json({ 
          data: {}, code: CONSTANT.UNAUTHORIZED, message: "Invalid token." 
        });
      } 
      
      // 5. Fetch user from DB using the ID encoded in the token (decoded.sub)
      const userDetails = await UserModel.findById(decoded.sub);

      if (!userDetails) {
        console.error('User not found');
        return res.status(CONSTANT.UNAUTHORIZED).json({ 
          code: CONSTANT.UNAUTHORIZED, 
          message: CONSTANT.USER_NOT_FOUND || "User not found" 
        });
      }

      // 6. Attach user to request and proceed to the controller
      req.user = userDetails;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(CONSTANT.INTERNAL_SERVER_ERROR).json({ 
      code: CONSTANT.INTERNAL_SERVER_ERROR, message: "Internal server error" 
    });
  }
};

module.exports = userAuth;