const Blog = require("../models/blogModel")
const User = require("../models/userModel")
const asyncHandler = require('express-async-handler')
const validateMongoDbId = require("../utils/validateMongodbId")
const cloudinary = require("../utils/cloudinary")
const fs = require('fs')


const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body)
    res.json(newBlog)
  } catch (e) {
    throw new Error(e)
  }
})

const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateBlog);
  } catch (error) {
    throw new Error(error);
  }
});


//  get and update blog
const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaBlog = await Blog.findById(id)
      .populate("likes")
      .populate("dislikes");
    const updateViews = await Blog.findByIdAndUpdate(
      id,
      {
        $inc: { numViews: 1 },
      },
      { new: true }
    );
    res.json(getaBlog);
  } catch (error) {
    throw new Error(error);
  }
})


//   get all blogs
const allBlogs = asyncHandler(async (req, res) => {
  const allBlog = await Blog.find()
  res.json(allBlog)
})

//  get blog
const getABlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try{
    const getblog = await Blog.findById(id)
  res.json(getblog)
  }catch(e){throw new Error(e)}
})


// delete a blog
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  try {
    const deleteBlog = await Blog.findByIdAndDelete(id);
    res.json(deleteBlog)
  } catch (e) { throw new Error(e) }
})

// like a blog
const likeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body
  validateMongoDbId(blogId)
  const blog = await Blog.findById(blogId);
  // find the login user
  const loginUserId = req?.user?.id;
  // find if the user has liked the blog
  const isLiked = blog?.isLiked;
  // find if the user has disliked the blog
  const alreadyDisliked = blog?.dislikes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  if (alreadyDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      { new: true }
    );
    res.json(blog);
  }
  if (isLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
      },
      { new: true }
    );
    res.json(blog);
  }
})

// dislike a blog
const disliketheBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongoDbId(blogId)
  const blog = await Blog.findById(blogId);
  // find the login user
  const loginUserId = req?.user?.id;
  // find if the user has liked the blog
  const isDisLiked = blog?.isDisliked
  // find if the user has disliked the blog
  const alreadyLiked = blog?.likes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  if (alreadyLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(blog);
  }
  if (isDisLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      { new: true }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { dislikes: loginUserId },
        isDisliked: true,
      },
      { new: true }
    );
    res.json(blog);
  }
});

//images
const uploadImages = asyncHandler(async (req, res) => {

  const { id } = req.params
  validateMongoDbId(id)
  try {
      const files = req.files;
      const uploader = (path) => cloudinary.uploader.upload(path);
      const urls = [];
      for (const file of files) {
          const { path } = file;
          const newpath = await uploader(path);
          // console.log(newpath);
          urls.push(newpath);
          fs.unlinkSync(path);
      }
      const url =  urls.map((file) => {
          return file.secure_url
      })
      // console.log(url)
      const findBlog = await Blog.findByIdAndUpdate(
          id,
          {
              images: url 
          })
      res.json(findBlog);
  } catch (error) {
      throw new Error(error);
  }
});

module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getABlog,
  allBlogs,
  deleteBlog,
  likeBlog,
  disliketheBlog,
  uploadImages
}