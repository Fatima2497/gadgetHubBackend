const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema(
  {
    user: {
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true
    },
    shippingInfo:{
      firstname: {
        type: String,
        required: true
      },
      lastname:{
        type: String,
        required: true
      },
      address:{
        type: String,
        required:true
      },
      city:{
        type: String,
        required:true
      },
      state:{
        type: String,
        required:true
      },
      other:{
        type: String,
      },
      pincode:{
        type: Number,
        required:true
      },
    },
    paymentInfo:{
      cashonOrder: {
        type: String,
        required: true,
        default:"Cash On Deliver"
      },
    },
    orderItems:[
      {
        product:{
          type: mongoose.Schema.Types.ObjectId,
          ref:"Product",
          required: true,
        },
        color:{
          type: mongoose.Schema.Types.ObjectId,
          ref:"Color",
          required:true,
        },
        quantity:{
          type:Number,
          required:true
        },
        price:{
          type:Number,
          required:true
        }
      }
    ],
    paidAt:{
      type:Date,
      default:Date.now()
    },
    totalAmount:{
      type:Number,
      required:true
    },
    totalAmountAfterDiscount:{
      type:Number,
      required:true
    },
    orderStatus:{
      type:String,
      default:"Ordered",
      enum:["Ordered","In Progress","Dispatch","Delivered"]
    },
  },
  {
    timestamps: true,
  }
);

// Export the model
module.exports = mongoose.model("Order", orderSchema);
