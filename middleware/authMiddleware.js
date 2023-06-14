const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')


const authMiddleware = asyncHandler(async(req,res,next) => {
    res.setHeader("Content-Type", "application/json");
    let token;
    if(req?.headers?.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        try {
            if(token){
                const decoded = jwt.verify(token, process.env.SECRETKEY);
                req.user = decoded.user
                next()
            }
        } catch (e) {
            throw new Error("Not Authorized! Please Login Again")
        }
    } else{
        throw new Error("You are not Authenticate")
    }
})

const isAdmin = asyncHandler(async(req,res,next) => {

    // const {email} = req.user
    // const adminUser = await User.findOne({email})
    if(req.user.role !== "admin"){
        throw new Error('You are not admin')
    }else{
        next();
    }
})

module.exports = {authMiddleware, isAdmin}