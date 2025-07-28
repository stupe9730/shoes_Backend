const asyncHandler = require("express-async-handler");
const Admin = require("../model/Admin");
const path = require("path");
const fs = require("fs/promises");
const { upload } = require("../cloudinary"); // cloudinary.js चा path द्या 
const { cloudinary } = require("../cloudinary");
// const { upload } = require("../utils/upload");


exports.addProducts = asyncHandler(async (req, res) => {
  upload.single("img")(req, res, async (err) => {
    if (req.body.color === "undefined") {
      return res.status(400).json({ message: "Select Color" });
    } else if (req.body.size === "undefined") {
      return res.status(400).json({ message: "Select Size" });
    } else if (req.body.category === "undefined") {
      return res.status(400).json({ message: "Select Category" });
    } else if (!req.file) {
      return res.status(400).json({ message: "Select File" });
    } else if (err) {
      return res.status(400).json({ message: err.message || "Unable to upload image" });
    }

    // Cloudinary image path
    const imageUrl = req.file.path;

    // तुमचं MongoDB मध्ये img field ला imageUrl assign करा
    await Admin.create({ ...req.body, img: imageUrl });

    res.status(201).json({ message: "Product Add Success" });
  });
});
// exports.addProducts = asyncHandler(async (req, res) => {
//     upload(req, res, async err => {
//         if (req.body.color === "undefined") {
//             res.status(400).json({ message: "Select Color" })
//         } else if (req.body.size === "undefined") {
//             res.status(400).json({ message: "Select Size" })
//         } else if (req.body.category === "undefined") {
//             res.status(400).json({ message: "Select Category" })
//         }
//         else if (!req.file) {
//             res.status(400).json({ message: "Select File" })
//         }
//         else {

//             // if (!req.file) {
//             //     return res.status(400).json({ message: "Chuse File" })
//             // }

//             if (err) {
//                 return res.status(400).json({ message: err.message || "unable to Upload Image" })
//             }
//             await Admin.create({ ...req.body, img: req.file.filename })
//             res.status(202).json({ message: "Product Add Success" })
//         }

//     })
// })


exports.getProducts = asyncHandler(async (req, res) => {
    const { selecter } = req.query

    if (selecter === "Men") {
        const result = await Admin.find({ category: "Man" })
        res.status(200).json({ message: "Product Get Success", result })
    } else if (selecter === "Women") {
        const result = await Admin.find({ category: "Women" })
        res.status(200).json({ message: "Product Get Success", result })
    } else if (selecter === "Kid") {
        const result = await Admin.find({ category: "Kid" })
        res.status(200).json({ message: "Product Get Success", result })
    } else {
        const filter = await Admin.find()
        const nameFilter = req.query.name || ''; // Get name from query parameters

        // Retrieve all products from the backend
        const allProducts = await Admin.find();

        // Filter products based on the name
        const result = allProducts.filter(product =>
            product.name.toLowerCase().includes(nameFilter.toLowerCase())
        );
        res.status(200).json({ message: "Product Get Success", result })
    }
})


exports.updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingProduct = await Admin.findById(id);
  if (!existingProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  let updatedData = {
    name: req.body.name,
    price: req.body.price,
    desc: req.body.desc,
    color: req.body.color,
    size: req.body.size,
    category: req.body.category,
  };

  // ✅ image update if sent
  console.log(req.file,"some");
  
  if (req.file) {
    try {
      // Delete old image from Cloudinary
      const oldImageUrl = existingProduct.img;
      const filename = oldImageUrl.split("/").slice(-1)[0].split(".")[0];
      const publicId = `products/${filename}`;

      await cloudinary.uploader.destroy(publicId);

      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });

      updatedData.img = result.secure_url;
      fs.unlinkSync(req.file.path); // clean local file
    } catch (error) {
      console.error("Image update error:", error);
      return res.status(500).json({ message: "Failed to update image" });
    }
  }

  const updated = await Admin.findByIdAndUpdate(id, updatedData, { new: true });

  res.status(200).json({ message: "Product updated", product: updated });
});
// exports.updateProducts = asyncHandler(async (req, res) => {
//     res.status(200).json({ message: "Product Update Success" })
// })

// Delete Product Cloudnary
exports.deleteProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Admin.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  try {
    const imageUrl = product.img;
    const urlWithoutExtension = imageUrl.substring(0, imageUrl.lastIndexOf("."));
    const publicId = urlWithoutExtension.split("/").slice(-2).join("/"); // e.g. "products/shirt123"
    const cloudResult = await cloudinary.uploader.destroy(publicId);
    await Admin.findByIdAndDelete(id);
    res.json({ message: "Product Delete Success" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete image or product", error });
  }
});

// delte Product multer
// exports.deleteProducts = asyncHandler(async (req, res) => {
//     const { id } = req.params
//     const result = await Admin.findById(id)
//     await fs.unlink(path.join(__dirname, "..", "uploads", result.img))
//     console.log(result);
//     await Admin.findByIdAndDelete(id)
//     res.json({ message: "Product Delete Success" })
// })
