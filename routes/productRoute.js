const express = require("express");
const { createProduct, getaProduct, getProduct, productUpdate, productDelete, addwishList, totalratings, getProductRating } = require('../controller/productCtrl')
const router = express.Router()
const {authMiddleware, isAdmin} = require('../middleware/authMiddleware');

router.post('/createProduct' , authMiddleware, isAdmin ,createProduct)
router.get('/getaProduct/:id' ,getaProduct)
router.put("/wishList", authMiddleware, addwishList)
router.put("/rating", authMiddleware, totalratings)
router.get('/getProduct' , getProduct)


router.put('/:id' , authMiddleware, isAdmin ,productUpdate)
router.delete('/:id' ,authMiddleware, isAdmin , productDelete)
router.get('/getrating' ,authMiddleware, getProductRating)


module.exports = router