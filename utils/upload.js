
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: 'dn0eega9j',
  api_key: '311447271122789',
  api_secret: 'I2FyLbUqlD7xzsiwZaLI1TYx4KU',
});

// ✅ Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'my_project',  // Cloudinary मध्ये folder
    allowed_formats: ['jpg', 'png', 'jpeg'],
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

module.exports = {
  cloudinary,
  storage,
};


// const multer = require("multer")
// const { v4: uuid } = require("uuid")
// const path = require("path")

// const storage = multer.diskStorage({
//     filename: (req, file, cb) => {
//         const ext = path.extname(file.originalname)

//         const fn = uuid() + ext
//         cb(null, fn)
//     },
//     destination: (req, file, cb) => {
//         cb(null, "uploads")
//     }
// })
// exports.upload = multer({ storage }).single("img")