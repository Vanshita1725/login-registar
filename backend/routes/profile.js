const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const profileController = require('../controllers/profile');

// Get user profile
router.get('/', auth, profileController.getProfile);

// Update user profile
router.put('/', auth, profileController.updateProfile);

module.exports = router;

