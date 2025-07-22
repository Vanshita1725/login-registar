const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { check } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Register route
router.post('/register', [
    check('email').isEmail(),
    check('password').isLength({ min: 6 })
], authController.register);

// Login route
router.post('/login', authController.login);

// Forgot password route
router.post('/forgot-password', [
    check('email').isEmail()
], authController.forgotPassword);

module.exports = router;