const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, refreshToken, logout, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/register', registerValidation, validate, register);

router.post('/login', loginValidation, validate, login);

router.post('/refresh', refreshToken);

router.post('/logout', protect, logout);

router.get('/me', protect, getMe);

module.exports = router;
