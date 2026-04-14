const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

// Helper: Generate random password
const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// @desc    Get all users (paginated, searchable, filterable)
// @route   GET /api/users
// @access  Admin, Manager
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Search by name or email
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (req.query.role && ['admin', 'manager', 'user'].includes(req.query.role)) {
      filter.role = req.query.role;
    }

    // Filter by status
    if (req.query.status && ['active', 'inactive'].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    // Managers cannot see admin users
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

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin, Manager, User (own profile)
const getUserById = async (req, res) => {
  try {
    const targetId = req.params.id;

    // Users can only view their own profile
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

    // Managers cannot view admin profiles
    if (req.user.role === 'manager' && user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view admin profiles' });
    }

    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Admin only
const createUser = async (req, res) => {
  try {
    const { name, email, role, status, autoGeneratePassword } = req.body;
    let { password } = req.body;

    // Check if email already exists
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

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin (all fields), Manager (non-admin users, limited), User (own profile, limited)
const updateUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const requestingUser = req.user;

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Role-based update restrictions
    if (requestingUser.role === 'user') {
      // Users can only update their own profile
      if (requestingUser._id.toString() !== targetId) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this user' });
      }
      // Users cannot change role or email
      delete req.body.role;
      delete req.body.status;
      delete req.body.email;
    }

    if (requestingUser.role === 'manager') {
      // Managers cannot update admin users
      if (targetUser.role === 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to update admin users' });
      }
      // Managers cannot change roles to admin
      if (req.body.role === 'admin') {
        return res.status(403).json({ success: false, message: 'Managers cannot assign admin role' });
      }
      delete req.body.email; // Managers cannot change email
    }

    const allowedFields = ['name', 'email', 'role', 'status'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Handle password update
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

// @desc    Delete user (soft delete - deactivate)
// @route   DELETE /api/users/:id
// @access  Admin only
const deleteUser = async (req, res) => {
  try {
    const targetId = req.params.id;

    // Prevent self-deletion
    if (req.user._id.toString() === targetId) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const user = await User.findById(targetId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Soft delete: deactivate the user
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

// @desc    Hard delete user
// @route   DELETE /api/users/:id/permanent
// @access  Admin only
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

// @desc    Get user stats (dashboard)
// @route   GET /api/users/stats
// @access  Admin, Manager
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
