const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.changePassword = async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);
  await User.findByIdAndUpdate(req.user.id, {
    password: hashed,
  });
  res.json({ message: "Password updated" });
};
