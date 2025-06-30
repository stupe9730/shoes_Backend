const { addProducts, getProducts,  deleteProducts, updateProduct } = require("../controller/adminController")

const router = require("express").Router()

const express = require("express");
// const router = express.Router();
const multer = require("multer");
const { storage } = require("../utils/upload");
const upload = multer({ storage });


router
    .post("/addproduct", addProducts)
    .get("/getproduct", getProducts)
    .put("/updateproduct/:id",upload.single("newHero"), updateProduct)
    .delete("/deleteproduct/:id", deleteProducts)
    .post("/upload", upload.single("img"), (req, res) => {
  res.json({ imageUrl: req.file.path });
});

module.exports = router