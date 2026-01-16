const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },  // 'admin', 'manager', 'user'
  phoneNumber: { type: String, required: true },

  resetPasswordToken: {type: String},
  resetPasswordExpire: {type: Date},

});

module.exports = mongoose.model('User', userSchema);
