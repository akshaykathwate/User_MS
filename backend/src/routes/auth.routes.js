const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { login, refreshToken, logout, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

// Validation rules
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

// @route   POST /api/auth/login
router.post('/login', loginValidation, validate, login);

// @route   POST /api/auth/refresh
router.post('/refresh', refreshToken);

// @route   POST /api/auth/logout
router.post('/logout', protect, logout);

// @route   GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;
