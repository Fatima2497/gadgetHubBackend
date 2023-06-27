const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
// const Product = require('<path_to_Product_model>');
const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;

const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const uniqid = require("uniqid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshToken");
const sentEmail = require("./emailCtrl");
const crypto = require("crypto");

// create a new user
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (findUser) {
    throw new Error("User Already Exists");
  }

  const salt = await bcrypt.genSalt(11);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  const newUser = await User.create({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    mobile: req.body.mobile,
    password: hashPassword,
  });
  res.json(newUser);
});

//  login controller
const loginCtrl = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      throw new Error("User is not found");
    }

    const isMatch = await bcrypt.compare(password, findUser.password);

    if (!isMatch) {
      throw new Error("Invalid Credentials");
    }

    const refreshToken = await generateRefreshToken(findUser?._id);
    const update = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });

    const payLoad = {
      user: {
        id: findUser["_id"],
        role: findUser["role"],
      },
    };

    let token_auth = jwt.sign(payLoad, process.env.SECRETKEY);
    // res.header('token',token_auth)

    res.json({
      msg: "Login Successful",
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: token_auth,
    });
  } catch (e) {
    throw new Error(e);
  }
});

//  login controller
const adminLogin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const findAdmin = await User.findOne({ email: email });
    if (findAdmin.role !== "admin") {
      throw new Error("Not Authorized");
    }

    const isMatch = await bcrypt.compare(password, findAdmin.password);

    if (!isMatch) {
      throw new Error("Invalid Credentials");
    }

    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const update = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });

    const payLoad = {
      user: {
        id: findAdmin["_id"],
        role: findAdmin["role"],
      },
    };

    let token_auth = jwt.sign(payLoad, process.env.SECRETKEY);
    // res.header('token',token_auth)

    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      msg: "Login Successful",
      token: token_auth,
    });
  } catch (e) {
    throw new Error(e);
  }
});

// refreshToken
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("No refresh token");
  jwt.verify(refreshToken, process.env.SECRETKEY, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh Token");
    }
    const accessToken = jwt.sign(user.id, process.env.SECRETKEY);
    res.json({
      accessToken: accessToken,
    });
  });
});

// Logout functionality
const handlelogout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden
  }
  await User.findOneAndUpdate({
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // forbidden
});

// get all user
const getallUser = asyncHandler(async (req, res) => {
  try {
    const getUser = await User.find();
    res.json(getUser);
  } catch (e) {
    throw new Error(e);
  }
});

// get a single user
const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const user = await User.findById(id);
    res.json(user);
  } catch (e) {
    throw new Error(e);
  }
  console.log(id);
});

// delete a user
const deletedaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteuser = await User.findByIdAndDelete(id);
    res.json({
      msg: "deleteuser",
    });
  } catch (e) {
    throw new Error(e);
  }
});

// update a user
const updatedaUser = asyncHandler(async (req, res) => {
  const _id = req.user.id;
  validateMongoDbId(_id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
        role: req?.body?.role,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// update address
const saveAddress = asyncHandler(async (req, res, next) => {
  const id = req.user.id;
  validateMongoDbId(id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        address: req?.body?.address,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// block user
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json({
      msg: "Blocked User",
    });
  } catch (e) {
    throw new Error(e);
  }
});

// unblock user
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      msg: "Unblock User",
    });
  } catch (e) {
    throw new Error(e);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  console.log(userId);
  const { password } = req.body;
  validateMongoDbId(userId);
  const user = await User.findById(userId);
  if (password) {
    const salt = await bcrypt.genSalt(11);
    const hashPassword = await bcrypt.hash(password, salt);
    user.password = hashPassword;

    //    user.password = password
    console.log(hashPassword);
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

// Forget Password
const forgetPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User Not Fount with this Email");
  }
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi, Please follow this link to reset your Password This link is valid till 10 min from now. <a href='http://localhost:5173/reset-password/${token}'>Click Here</a>`;
    const data = {
      to: email,
      subject: "Forget Password Link",
      text: "Hey User",
      html: resetURL,
    };
    sentEmail(data);
    res.json(token);
  } catch (e) {
    throw new Error(e);
  }
});

//  reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error(" Token Expired, Please try again later");

  const salt = await bcrypt.genSalt(11);
  const hashPassword = await bcrypt.hash(password, salt);
  user.password = hashPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  res.json(user);
});

//get wishlist
const getWishList = asyncHandler(async (req, res) => {
  const id = req.user.id;
  console.log(id);
  try {
    const getwishList = await User.findById(id).populate("wishlist");
    res.json(getwishList);
  } catch (e) {
    throw new Error(e);
  }
});

const userCart = asyncHandler(async (req, res) => {
  const { productId, color, quantity, price } = req.body;
  const _id = req.user.id;
  validateMongoDbId(_id);

  try {
    
    let newCart = await new Cart({
      userId: _id,
      productId,
      color,
      quantity,
      price,
    }).save();
    res.json(newCart);
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const _id = req.user.id;
  validateMongoDbId(_id);
  console.log(_id);
  try {
    const getCart = await Cart.find({ userId: _id }).populate(
      "productId"
    ).populate("color")
    res.json(getCart);
  } catch (e) {
    throw new Error(e);
  }
});

const removeproductFromCart = asyncHandler(async (req, res) => {
  const _id = req.user.id;
  const {cartItemId} = req.params
  validateMongoDbId(_id);
  
  try {
    const deleteproductfromCart = await Cart.deleteOne({userId:_id, _id:cartItemId})
    res.json(deleteproductfromCart);
  } catch (e) {
    throw new Error(e);
  }
});

const updateprodquantCart = asyncHandler(async (req, res) => {
  const _id = req.user.id;
  const {cartItemId,newQuantity} = req.params
  validateMongoDbId(_id);
  
  try {
    const cartItem = await Cart.findOne({userId:_id, _id:cartItemId})
    cartItem.quantity = newQuantity
    cartItem.save()
    res.json(cartItem);
  } catch (e) {
    throw new Error(e);
  }
});

const createOrder = asyncHandler(async (req, res) => {
  try {
    const _id = req.user.id
    validateMongoDbId(_id)
    console.log(_id);
    const {shippingInfo,orderItems,totalAmount,totalAmountAfterDiscount} = req.body

    const order = await Order.create({
      shippingInfo,
      orderItems, // Wrap orderItems in an array
      totalAmount,
      totalAmountAfterDiscount,
      user: _id,
    });
    res.json({
      order,
      success:true
    })
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }
});

const myOrder = asyncHandler(async(req,res) => {
  const _id = req.user.id
  validateMongoDbId(_id)
  try{
    const order = await Order.find({user: _id}).populate("user").populate("orderItems.product").populate("orderItems.color")
    res.json(order)
  }catch(e){ throw new Error(e)}
})

const getAllOrder = asyncHandler(async(req,res) => {
  const _id = req.user.id
  validateMongoDbId(_id)
  try{
    const order = await Order.find().populate("user").populate("orderItems.product").populate("orderItems.color")
    res.json(order)
  }catch(e){ throw new Error(e)}
})

const getAOrder = asyncHandler(async(req,res) => {
  const _id = req.user.id
  validateMongoDbId(_id)
  try{
    const {id} = req.params
    const order = await Order.findById(id).populate("user").populate("orderItems.product").populate("orderItems.color")
    res.json(order)
  }catch(e){ throw new Error(e)}
})

const getMonthWiseIncom = asyncHandler(async (req, res) => {
  try {
    let monthName = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let d = new Date();
    let endDate = "";
    d.setDate(1);
    for (let i = 0; i < 11; i++) {
      d.setMonth(d.getMonth() - 1);
      endDate = monthName[d.getMonth()] + " " + d.getFullYear();
    }
    console.log(endDate);
    const data = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $lte: new Date(),
            $gte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
          },
          amount: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);
    res.json(data);
  } catch (e) {
    throw new Error(e);
  }
});

const getYearlyOrder = asyncHandler(async (req, res) => {
  try {
    let monthName = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let d = new Date();
    let endDate = "";
    d.setDate(1);
    for (let i = 0; i < 11; i++) {
      d.setMonth(d.getMonth() - 1);
      endDate = monthName[d.getMonth()] + " " + d.getFullYear();
    }
    console.log(endDate);
    const data = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $lte: new Date(),
            $gte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: "$totalAmount" },
        },
      },
    ]);
    res.json(data);
  } catch (e) {
    throw new Error(e);
  }
});

module.exports = {
  createUser,
  loginCtrl,
  getallUser,
  getaUser,
  deletedaUser,
  updatedaUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  handlelogout,
  updatePassword,
  forgetPasswordToken,
  resetPassword,
  adminLogin,
  getWishList,
  saveAddress,
  userCart,
  getUserCart,
  removeproductFromCart,
  updateprodquantCart,
  createOrder,
  myOrder,
  getAllOrder,
  getAOrder,
  getMonthWiseIncom,
  getYearlyOrder,
};
