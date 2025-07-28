const {
  loginUser,
  registerUser,
  otpSender,
  otpVerfy,
  ResetPass,
} = require("../controller/loginController");

const router = require("express").Router();

router
  .post("/login", loginUser)
  .post("/register", registerUser)
  .post("/otp", otpSender)
  .post("/verify", otpVerfy)
  .post("/resetPass", ResetPass);

module.exports = router;
