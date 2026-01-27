const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { changePassword } = require('../controllers/userController');

const router = express.Router();

router.patch("/change-password", authMiddleware, changePassword);

router.get('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {

    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

router.patch('/:id/role', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['admin', 'manager', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Role updated', user });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ message: 'Failed to update role', error: err.message });
  }
});

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  }
);

module.exports = router;
