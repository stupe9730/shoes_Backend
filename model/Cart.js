const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({
    ProId: {
        type: mongoose.Types.ObjectId,
        ref: 'shoesPro'
    },
    logerId: {
        type: mongoose.Types.ObjectId,
        ref: 'auth'
    },
    qut: {
        type: Number,
        required: true,
    },
})

module.exports = mongoose.model("cart", cartSchema)