const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      // select: false, // 👈 VERY IMPORTANT (hides password by default)
    },

    role: {
      type: String,
      enum: ["admin", "manager", "user"],
      default: "user",
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    // Password reset fields
    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },
  },
  {
    timestamps: true, // 👈 createdAt & updatedAt
  }
);

module.exports = mongoose.model("User", userSchema);
