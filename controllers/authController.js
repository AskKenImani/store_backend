
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// ==========================
// SIGNUP
// ==========================
const signup = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, role } = req.body;

    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: role || "user",
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error signing up user",
      error: err.message,
    });
  }
};

// ==========================
// LOGIN
// ==========================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      message: "Logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error logging in user",
      error: err.message,
    });
  }
};

// ==========================
// FORGOT PASSWORD
// ==========================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Forgot password request for:", email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 10 minutes.</p>
      `,
    });

    res.json({ message: "Password reset link sent to email" });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({
      message: "Error sending reset email",
      error: err.message,
    });
  }
};


// ==========================
// RESET PASSWORD
// ==========================
const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({
      message: "Error resetting password",
      error: err.message,
    });
  }
};

// ==========================
// GET CURRENT USER
// ==========================
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { _id, name, email, role } = req.user;
    res.json({ _id, name, email, role });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching user profile",
      error: err.message,
    });
  }
};

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getMe,
};
