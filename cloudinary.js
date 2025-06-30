// cloudinary.js
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: "तुमचं_CLOUD_NAME",
  api_key: "तुमचं_API_KEY",
  api_secret: "तुमचं_API_SECRET",
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products", // cloudinary वर products नावाचं folder तयार होईल
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

const multer = require("multer");
const upload = multer({ storage });

module.exports = {
  upload,
  cloudinary,
};
