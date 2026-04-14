const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  permanentDeleteUser,
  getUserStats
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

// Validation rules
const createUserValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'manager', 'user']).withMessage('Invalid role'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
];

const updateUserValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'manager', 'user']).withMessage('Invalid role'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
];

// All routes require authentication
router.use(protect);

// Stats route - Admin and Manager only
router.get('/stats', authorize('admin', 'manager'), getUserStats);

// List all users - Admin and Manager
router.get('/', authorize('admin', 'manager'), getAllUsers);

// Create user - Admin only
router.post('/', authorize('admin'), createUserValidation, validate, createUser);

// Get user by ID - All roles (with restrictions in controller)
router.get('/:id', getUserById);

// Update user - All roles (with restrictions in controller)
router.put('/:id', updateUserValidation, validate, updateUser);

// Soft delete (deactivate) - Admin only
router.delete('/:id', authorize('admin'), deleteUser);

// Permanent delete - Admin only
router.delete('/:id/permanent', authorize('admin'), permanentDeleteUser);

module.exports = router;
