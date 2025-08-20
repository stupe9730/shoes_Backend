const asyncHandler = require("express-async-handler");
const Admin = require("../model/Admin");
const Cart = require("../model/Cart");
const Order = require("../model/Order");

// exports.getUserProduct = asyncHandler(async (req, res) => {
//     const { selecter, color, size, price } = req.query
//     // console.log(price, color, size, selecter);
//     let query = { category: selecter, };
//     if (color) {
//         query.color = color;
//     }
//     if (size) {
//         query.size = size
//     }
//     if (price) {
//         query.price = { $gte: price };
//     }
//     const result = await Admin.find(query);
//     res.status(200).json({ message: "Product Get Success", result })
// })

exports.getUserProduct = asyncHandler(async (req, res) => {
  const { selecter, color, size, price, page = 1, limit = 10 } = req.query;
  console.log(req.query);

  let query = { category: selecter };

  if (color) query.color = color;
  if (size) query.size = size;
  if (price) {
    query.price = { $gte: 169, $lte: parseInt(price) };
  }

  // Check if filters are applied
  const isFilterApplied = color || size || price;

  let result, totalProducts;

  if (isFilterApplied) {
    // Without pagination
    result = await Admin.find(query);
    totalProducts = result.length;
  } else {
    // With pagination
    const skip = (page - 1) * limit;
    totalProducts = await Admin.countDocuments(query);
    result = await Admin.find(query).skip(skip).limit(parseInt(limit));
  }

  res.status(200).json({
    message: "Product Get Success",
    result,
    totalPages: isFilterApplied ? 1 : Math.ceil(totalProducts / limit),
    currentPage: isFilterApplied ? 1 : parseInt(page),
  });
});

exports.getUserCartProduct = asyncHandler(async (req, res) => {
  const { _id } = req.query;
  const result = await Admin.findOne({ _id });
  res.status(200).json({ message: "Cart Product add success", result });
});

// Cart Products

exports.addToCart = asyncHandler(async (req, res) => {
  await Cart.create(req.body);
  res.status(200).json({ message: "Add To Cart Succes" });
});

exports.getToCart = asyncHandler(async (req, res) => {
  const { logerId } = req.query;
  const result = await Cart.find({ logerId });
  const proIds = result.map((item) => item.ProId);

  const filteredData = await Admin.find({ _id: { $in: proIds } });
  const combinedData = result.map((cartItem) => {
    const adminItem = filteredData.find((adminDoc) =>
      adminDoc._id.equals(cartItem.ProId)
    );

    return {
      ...cartItem.toObject(), // Convert Cart item to plain object
      ...(adminItem ? adminItem.toObject() : {}), // Convert Admin item to plain object and merge
    };
  });

  res.status(200).json({ message: "Get Cart Success", combinedData });
});

exports.removeToCart = asyncHandler(async (req, res) => {
  console.log(req.body.ProId);
  await Cart.findOneAndDelete({ ProId: req.body.ProId });
  res.status(200).json({ message: " Cart Remove Success" });
});
exports.addOrder = asyncHandler(async (req, res) => {
  try {
    // 1. Get all cart data
    const cartData = await Cart.find().lean(); // lean() gives plain JS objects

    // 2. Remove _id and __v from each item
    const cleanedData = cartData.map((item) => {
      const { _id, __v, ...rest } = item;
      return rest; // only the fields needed for Order
    });

    // 3. Insert into Order collection
    await Order.insertMany(cleanedData);

    res
      .status(200)
      .json({ message: "✅ Cart data moved to Order successfully" });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

exports.getOrder = asyncHandler(async (req, res) => {
  const { logerId } = req.query;
  console.log(logerId);

  // Get all orders for the user
  const result = await Order.find({ logerId });

  // Extract product IDs from orders
  const proIds = result.map((item) => item.ProId);

  // Get product details from Admin collection
  const filteredData = await Admin.find({ _id: { $in: proIds } });

  // Merge data
  const combinedData = result.map((cartItem) => {
    const adminItem = filteredData.find((adminDoc) =>
      adminDoc._id.equals(cartItem.ProId)
    );

    return {
      ...cartItem.toObject(), // Order fields
      remo: adminItem ? adminItem.toObject() : {}, // Admin fields inside `remo`
    };
  });

  res.status(200).json({ message: "Get Cart Success", combinedData });
});

exports.removeOrder = asyncHandler(async (req, res) => {
  // const { logerId } = req.query;
  const { id } = req.params;
  console.log(id);

  const result = await Order.findByIdAndDelete(id);
  console.log(result);

  res.status(200).json({ message: "Order Cancel Succes" });
});
