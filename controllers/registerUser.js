const User = require('../models/User');  // Assuming you have a User model

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body; // Include role in the request body

  try {
    const user = new User({
      name,
      email,
      password,  // Make sure to hash the password before saving it
      role: role || 'user',  // Default role is 'user'
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
};

module.exports = { registerUser };
