const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
// const User = require("../models/User")
exports.userProtected = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No Cookie Found" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
    if (err) {
      return res.status(401).json({ message: err.message || "JWT Error" });
    }
    req.body.userId = decode.userId;
    next();
  });
});
