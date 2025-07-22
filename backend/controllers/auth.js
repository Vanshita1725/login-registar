const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log('Registration attempt:', { username, email, password: password ? '***' : undefined });
    // Validate input
    if (!username || !email || !password) {
      console.log('Registration failed: Missing fields');
      return res.status(400).json({ error: 'All fields are required.' });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Registration failed: Email already in use');
      return res.status(400).json({ error: 'Email already in use.' });
    }
    // Create and save the new user (let the pre-save hook hash the password)
    const user = new User({ username, email, password });
    await user.save();
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Registration successful:', { userId: user._id, email });
    res.status(201).json({ token, message: 'Registration successful.' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again later.' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password: password ? '***' : undefined });
    // Validate input
    if (!email || !password) {
      console.log('Login failed: Missing fields');
      return res.status(400).json({ error: 'All fields are required.' });
    }
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: No user found for email', email);
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      console.log('Login failed: Incorrect password');
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful:', { userId: user._id, email });
    res.json({ token, message: 'Login successful.' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again later.' });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Forgot password attempt for:', email);
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Forgot password failed: No user found for email', email);
      return res.status(404).json({ error: 'No account found with this email address.' });
    }
    
    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // In a real application, you would send an email here
    // For now, we'll just log the reset link
    const resetLink = `${req.protocol}://${req.get('host')}/auth/reset-password?token=${resetToken}`;
    console.log('Password reset link:', resetLink);
    
    // TODO: Send email with reset link
    // For development, you can check the console for the reset link
    
    res.json({ 
      message: 'Password reset link has been sent to your email address.',
      resetLink: resetLink // Remove this in production
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process password reset request.' });
  }
};