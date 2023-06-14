const express = require('express')
const { createCoupon, getallCoupon, getacoupon, updateacoupon, deleteacoupon } = require('../controller/couponCtrls')
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware')
const router = express.Router()

router.post("/", authMiddleware, isAdmin, createCoupon)
router.get("/", authMiddleware, isAdmin, getallCoupon)
router.get("/:id", authMiddleware, isAdmin, getacoupon)
router.put("/:id", authMiddleware, isAdmin, updateacoupon)
router.delete("/:id", authMiddleware, isAdmin, deleteacoupon)

module.exports = router