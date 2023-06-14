const Coupon = require('../models/couponModel')
const validateMongoDbID = require('../utils/validateMongodbId')
const asyncHandler = require('express-async-handler')

const createCoupon = asyncHandler(async (req,res) => {
    try{
        const newCoupon = await Coupon.create(req.body)
        res.json(newCoupon)
    }catch(e){throw new Error(e)}
}) 

const getallCoupon = asyncHandler(async (req,res) => {
    try{
        const allCoupon = await Coupon.find()
        res.json(allCoupon)
    }catch(e){throw new Error(e)}
}) 

const getacoupon = asyncHandler(async (req,res) => {
    const {id} = req.params
    validateMongoDbID(id)
    try{
        const getCoupon = await Coupon.findById(id)
        res.json(getCoupon)
    }catch(e){throw new Error(e)}
})

const updateacoupon = asyncHandler(async (req,res) => {
    const {id} = req.params
    validateMongoDbID(id)
    try{
        const updateCoupon = await Coupon.findByIdAndUpdate(id, req.body, {new: true})
        res.json(updateCoupon)
    }catch(e){throw new Error(e)}
})

const deleteacoupon = asyncHandler(async (req,res) => {
    const {id} = req.params
    validateMongoDbID(id)
    try{
        const deleteCoupon = await Coupon.findByIdAndDelete(id)
        res.json(deleteCoupon)
    }catch(e){throw new Error(e)}
})


module.exports ={
    createCoupon,
    getallCoupon,
    getacoupon,
    updateacoupon,
    deleteacoupon
}