const mongoose = require("mongoose")

const authschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    loger: {
        type: String,
        required: true
    },
    otp: {
        type: Number,
    },
    updatedAt: {
        type: String,
    },
})

module.exports = mongoose.model("auth", authschema)