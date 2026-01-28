const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    paymentMethod: {
      type: String,
      default: "Paystack",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    receipt: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
