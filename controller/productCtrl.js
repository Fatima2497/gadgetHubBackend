const asyncHandler = require("express-async-handler")
const Product = require("../models/productModel")
const slugify = require('slugify')
const User = require("../models/userModel")
const validateMongoDbId = require("../utils/validateMongodbId")
const cloudinary = require("../utils/cloudinary")
const fs = require('fs')

// create Product
const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title)

        }
        const newProduct = await Product.create(req.body)
        res.json(newProduct)

    } catch (error) {
        throw new Error(error)
    }
})


// product update
const productUpdate = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title)
        }
        const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
            new: true
        })
        res.json(updateProduct)
    } catch (e) {
        throw new Error(e)
    }
})

// delete Product
const productDelete = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title)
        }
        const deleteProduct = await Product.findByIdAndDelete(id)
        res.json(deleteProduct)
    } catch (e) {
        throw new Error(e)
    }
})


// /get a single Product
const getaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const getProduct = await Product.findById(id)
        res.json(getProduct)
    } catch (e) {
        throw new Error(e)
    }
})

//  get products
const getProduct = asyncHandler(async (req, res) => {
    try {

        //Filtering
        const queryObj = { ...req.query }
        const excludeFields = ["Page", "sort", "limit", "fields"]
        excludeFields.forEach((el) => delete queryObj[el])
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        let query = Product.find(JSON.parse(queryStr))

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ')
            query = query.sort('sortBy')
        } else {
            query = query.sort('-createdAt')
        }

        // limiting the feilds
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ')
            query = query.select(fields)
        } else {
            query = query.select('-__v')
        }


        // pagination
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
            const productCount = await Product.countDocuments();
            if (skip >= productCount) throw new Error("This Page does not exists");
        }

        console.log(page, skip, limit);
        const product = await query;
        res.json(product);
    } catch (e) {
        throw new Error(e)
    }
})


const addwishList = asyncHandler(async (req, res) => {
    const id = req.user.id
    console.log(id)
    const { prodId } = req.body;
    try {
        const user = await User.findById(id);
        const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
        if (alreadyadded) {
            let user = await User.findByIdAndUpdate(
                id,
                {
                    $pull: { wishlist: prodId },
                },
                {
                    new: true,
                }
            );
            res.json(user);
        } else {
            let user = await User.findByIdAndUpdate(
                id,
                {
                    $push: { wishlist: prodId },
                },
                {
                    new: true,
                }
            );
            res.json(user);
        }
    } catch (error) {
        throw new Error(error);
    }
});

// ratings
const totalratings = asyncHandler(async (req, res) => {
    const id = req.user.id
    const { star, prodId, comment } = req.body;

    const product = await Product.findById(prodId)

    let alreadyRated = product.ratings.find((userId) => userId.postedBy.toString() === id.toString())

    try {
        if (alreadyRated) {
            const updateRating = await Product.updateOne(
                {
                    ratings: { $elemMatch: alreadyRated },
                },
                {
                    $set: { "ratings.$.star": star, "ratings.$.comment": comment }
                },
                {
                    new: true
                }
            )
        } else {
            const rateProduct = await Product.findByIdAndUpdate(prodId, {
                $push: {
                    ratings: {
                        star: star,
                        comment: comment,
                        postedBy: id
                    },
                },
            },
                {
                    new: true
                }
            );
        }
        // get total ratings
        const getallRatings = await Product.findById(prodId)
        let totalRatings = getallRatings.ratings.length;
        console.log(totalRatings);

        let ratingsum = getallRatings.ratings.map((item) => item.star).reduce((prev, curr) => prev + curr, 0)

        let actualRating = Math.round(ratingsum / totalRatings);
        let finalProduct = await Product.findByIdAndUpdate(prodId,
            {
                totalrating: actualRating,
            },
            {
                new: true
            }
        )
        res.json(finalProduct)
    } catch (e) { throw new Error(e) }
})


module.exports = {
    createProduct,
    getaProduct,
    getProduct,
    productUpdate,
    productDelete,
    addwishList,
    totalratings,
    
}