/* eslint-disable no-undef */
const jwt = require("jsonwebtoken");

//define middleware function
const authMiddleware = (req, res, next) => {
  try {
    //reads header authorization
    const authHeader = req.headers.authorization;

    //check if header is present and starts with Bearer
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided, authorization denied",
      });
    }

    //extract token
    const token = authHeader.split(" ")[1];

    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //attach user to request
    req.user = {
      id: decoded.userId,
    };

    //proceed to next middleware
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(500).json({
      message: "Server error in auth middleware",
    });
  }
};

module.exports = authMiddleware;
