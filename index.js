const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { userProtected } = require("./middleware/protected");
require("dotenv").config({ path: "./.env" });

mongoose.connect(process.env.BASE_URL);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "https://shoes-frontend-iwwf.onrender.com",
    // origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.static("uploads"));
app.use("/api/auth", require("./router/loginRoute"));
app.use("/api/admin", userProtected, require("./router/adminRoute"));
app.use("/api/user", require("./router/userRoute"));

// 404 error catch
app.use("*", (req, res) => {
  res.status(404).json({ message: "Resource Not Found" });
});
// error handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ message: err.message || "Something Is Wrong" });
});

mongoose.connection.once("open", () => {
  console.log("MONGOOSE CONNECTED");
  app.listen(process.env.PORT || 400, console.log("SERVER RUNNING"));
});
