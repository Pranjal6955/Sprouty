const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Sign JWT and return
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Log complete request body for debugging (excluding password)
    const debugBody = { ...req.body };
    if (debugBody.password) debugBody.password = '****';
    console.log('Registration request body:', JSON.stringify(debugBody));

    // Validate required fields
    if (!name || !email || !password) {
      console.log('Registration failed: Missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide name, email and password',
        missing: {
          name: !name,
          email: !email,
          password: !password
        }
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      console.log(`Registration failed: Invalid email format for ${email}`);
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // Check password length
    if (password.length < 6) {
      console.log('Registration failed: Password too short');
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists by email
    let user = await User.findOne({ email });
    
    if (user) {
      console.log(`Registration failed: User ${email} already exists`);
      return res.status(400).json({ 
        success: false, 
        error: 'User already exists with this email address'
      });
    }

    try {
      // Create user
      user = new User({
        name,
        email,
        password,
        authProvider: 'local'
      });

      await user.save();
      console.log(`User registered successfully: ${email}`);

      // Generate JWT
      const token = signToken(user._id);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (dbError) {
      console.error('Database error during registration:', dbError);
      return res.status(500).json({ 
        success: false, 
        error: 'Database error during registration',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
  } catch (err) {
    console.error('Registration error:', err);
    
    // Check for specific error types
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Server Error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, error: 'No user with that email' });
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // TODO: Implement email sending functionality here
    // For now, just return the token (in production, send via email)
    
    res.status(200).json({ 
      success: true, 
      data: 'Password reset link sent to email',
      resetToken // Remove this in production
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid token or token expired' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Return token
    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      token,
      message: 'Password reset successful'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Verify user token
// @route   GET /api/auth/verify-token
// @access  Private
exports.verifyToken = async (req, res, next) => {
  try {
    // If we reach here, the token is valid and the user is authenticated
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
