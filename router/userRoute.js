const { getUserProduct, getUserCartProduct, addToCart, getToCart, removeToCart, addOrder, getOrder } = require('../controller/userController')
const { userProtected } = require('../middleware/protected')

const router = require('express').Router()

router
    .get('/getUserProduct', getUserProduct)
    .get('/getUserCartProduct', getUserCartProduct)

    // Cart
    .post('/addToCart', userProtected, addToCart)
    .get('/getToCart', userProtected, getToCart)
    .delete('/removeToCart', removeToCart)

    // order
    .post('/addOrder', userProtected, addOrder)
    .get('/getOrder', userProtected, getOrder)

module.exports = router