const express = require('express')
const { createBlog, updateBlog, getBlog, allBlogs, deleteBlog, likeBlog, disliketheBlog, uploadImages, getABlog } = require('../controller/blogCtrl')
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware')
const router = express.Router()
const { uploadPhoto, blogImgResize,} = require("../middleware/uploadImages")

router.put("/likes", authMiddleware, likeBlog)
router.put("/dislike", authMiddleware, disliketheBlog)
router.post("/createBlog",authMiddleware, isAdmin, createBlog) // create blog end point
router.put('/upload/:id' , authMiddleware, isAdmin , uploadPhoto.array('images',2), blogImgResize, uploadImages )
router.put("/updateBlog/:id",authMiddleware, isAdmin, updateBlog) // simple update blog end point
router.put("/:id",authMiddleware, isAdmin, getBlog) // get blog and then update a blog by id
router.get("/allBlogs",authMiddleware, isAdmin, allBlogs) // get all blogs
router.get("/:id",authMiddleware, isAdmin, getABlog) // get all blogs
router.delete("/:id",authMiddleware, isAdmin, deleteBlog) // delete a blog 
module.exports = router