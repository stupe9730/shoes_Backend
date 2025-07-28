const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const bcript = require("bcrypt");
const Login = require("../model/Login");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Admin = require("../model/Admin");
require("dotenv").config({ path: "./.env" });
const emailExistence = require("email-existence");

exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, loger } = req.body;

  // Step 1: Validate email format

  // Step 2: Check if email exists (SMTP probe)

  // Step 3: Check if email is already registered in DB
  const result = await Login.findOne({ email });

  if ((!name, !loger, !email, !password)) {
    return res.status(400).json({ message: "Enter Info Validation " });
  }
  if (result) {
    return res.status(400).json({ message: "Email already registered" });
  }

  // Step 4: Validate "loger"
  if (!loger) {
    return res.status(400).json({ message: "Select loger" });
  }

  // Step 5: Validate password
  const isValidPassword =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  if (!isValidPassword) {
    return res.status(400).json({
      message:
        "Weak password: Must include 1 capital letter, 1 number, 1 special character, and be at least 8 characters long.",
    });
  }

  // Step 6: Register user
  const hash = await bcript.hash(password, 10);
  await Login.create({ ...req.body, password: hash });

  return res.status(200).json({ message: "Register success" });

  resolve(); // resolves the promise wrapper
});
exports.loginUser = asyncHandler(async (req, res) => {
  const { password, email, loger } = req.body;

  if ((!loger, !email, !password)) {
    return res.status(400).json({ message: "Enter Info Validation " });
  }
  const user = await Login.findOne({ email });
  //   console.log(loger === user.loger, "login");
  if (!(loger === user.loger)) {
    res.status(500).json({ message: "Wrong Loger" });
  }
  if (!user) {
    res.status(500).json({ message: "Plz Sign In Account" });
  }

  const verification = await bcript.compare(password, user.password);

  if (!verification) {
    res.status(400).json({ message: "Email or Password Not Maitch" });
  }
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 1000 * 60 * 60 * 24,
  });

  res.status(200).json({
    message: "Login Success",
    email: user.email,
    name: user.name,
    loger: user.loger,
    _id: user._id,
  });
});

exports.otpSender = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const validEmail = await Login.findOne({ email });
  console.log(`,,,${validEmail},,,`);
  if (!validEmail) {
    res.status(500).json({ message: "Email Not Valid" });
  }

  // console.log("Email user:", process.env.EMAIL_USER);
  // console.log("Email pass:", process.env.EMAIL_PASS);

  const transporter = nodemailer.createTransport({
    service: "gmail", // You can use any email service, like Gmail, Yahoo, etc.
    auth: {
      user: process.env.EMAIL_USER, // your email address
      pass: process.env.EMAIL_PASS, // your email password or app password
    },
  });
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Generate a 6-digit OTP
  const otp = crypto.randomInt(1000, 9999);

  // You might want to store the OTP in the database here (in production)
  // e.g., await User.updateOne({ email }, { otp, otpExpiration: Date.now() + 600000 }); // 10 minutes expiration

  // Send email with OTP
  const mailOptions = {
    from: process.env.EMAIL_USER, // your email
    to: email, // recipient's email
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
  };

  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ message: "Failed to send OTP" });
    }
    console.log("Email sent:", info.response);
    // res.status(200).json({ message: "OTP sent successfully", otp }); // Don't include OTP in production!
  });
  const allData = await Login.findOne({ email });

  const updatedData = await Login.findByIdAndUpdate(
    allData && allData._id,
    { otp: otp, updatedAt: Date.now() },
    { new: true }
  );

  res.status(200).json({ message: "Send OTP Success", updatedData });
});

exports.otpVerfy = asyncHandler(async (req, res) => {
  const { otp, email } = req.body;
  //   const find
  console.log(req.body, "line 33");
  const result = await Login.findOne({ email });
  console.log(result.otp === Number(otp), "line 34");

  if (result.otp === Number(otp)) {
    res.status(200).json({ message: "Otp Verifyed successfully", data: true });
  } else {
    res.status(500).json({ message: "try re-entering the correct OTP" });
  }
});

exports.ResetPass = asyncHandler(async (req, res) => {
  const { newPass, email } = req.body;
  //   const find
  const result = await Login.findOne({ email });

  if (!result) {
    res.status(500).json({ message: "Email Not Match" });
  } else {
    const lastUpdated = new Date(result.updatedAt);
    const now = new Date();
    const diffMinutes = (now - lastUpdated) / (1000 * 60);

    if (diffMinutes > 5) {
      return res
        .status(400)
        .json({ error: "❌ OTP expired (5 minutes limit)." });
    }
    const hashedPassword = await bcript.hash(newPass, 10);

    await Login.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
        otp: null,
        updatedAt: new Date().toISOString(),
      }
    );

    return res.json({ message: "✅ Password updated successfully." });
  }
});
