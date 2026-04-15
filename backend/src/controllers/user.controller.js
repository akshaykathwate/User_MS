const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.role && ['admin', 'manager', 'user'].includes(req.query.role)) {
      filter.role = req.query.role;
    }

    if (req.query.status && ['active', 'inactive'].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (req.user.role === 'manager') {
      filter.role = { $ne: 'admin' };
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password -refreshToken');

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const targetId = req.params.id;

    if (req.user.role === 'user' && req.user._id.toString() !== targetId) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this profile' });
    }

    const user = await User.findById(targetId)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user.role === 'manager' && user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view admin profiles' });
    }

    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, role, status, autoGeneratePassword } = req.body;
    let { password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    let generatedPassword = null;
    if (autoGeneratePassword || !password) {
      generatedPassword = generatePassword();
      password = generatedPassword;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      status: status || 'active',
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    const userResponse = await User.findById(user._id)
      .populate('createdBy', 'name email')
      .select('-password -refreshToken');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: userResponse,
        ...(generatedPassword && { generatedPassword })
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const requestingUser = req.user;

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (requestingUser.role === 'user') {
      if (requestingUser._id.toString() !== targetId) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this user' });
      }
      delete req.body.role;
      delete req.body.status;
      delete req.body.email;
    }

    if (requestingUser.role === 'manager') {
      if (targetUser.role === 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to update admin users' });
      }
      if (req.body.role === 'admin') {
        return res.status(403).json({ success: false, message: 'Managers cannot assign admin role' });
      }
      delete req.body.email; 
    }

    const allowedFields = ['name', 'email', 'role', 'status'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.body.password) {
      const salt = await bcrypt.genSalt(12);
      updates.password = await bcrypt.hash(req.body.password, salt);
    }

    updates.updatedBy = requestingUser._id;

    const updatedUser = await User.findByIdAndUpdate(
      targetId,
      updates,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .select('-password -refreshToken');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const targetId = req.params.id;

    if (req.user._id.toString() === targetId) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const user = await User.findById(targetId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = 'inactive';
    user.updatedBy = req.user._id;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: { userId: targetId }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const permanentDeleteUser = async (req, res) => {
  try {
    const targetId = req.params.id;

    if (req.user._id.toString() === targetId) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(targetId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getUserStats = async (req, res) => {
  try {
    const filter = req.user.role === 'manager' ? { role: { $ne: 'admin' } } : {};

    const [total, active, inactive, byRole] = await Promise.all([
      User.countDocuments(filter),
      User.countDocuments({ ...filter, status: 'active' }),
      User.countDocuments({ ...filter, status: 'inactive' }),
      User.aggregate([
        { $match: filter },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ])
    ]);

    const recentUsers = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name')
      .select('-password -refreshToken');

    res.status(200).json({
      success: true,
      data: { total, active, inactive, byRole, recentUsers }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  permanentDeleteUser,
  getUserStats
};
