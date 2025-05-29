const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1. Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from header (remove 'Bearer ' prefix)
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route',
        details: 'No authentication token provided. Make sure to include a Bearer token.'
      });
    }

    // Check if token is the placeholder
    if (token === 'YOUR_TOKEN') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format',
        details: 'Please replace "YOUR_TOKEN" with an actual token received from login or register'
      });
    }

    try {
      // 3. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find user with the token's id
      req.user = await User.findById(decoded.id);
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not found with this token',
          details: 'The user associated with this token may have been deleted'
        });
      }

      next();
    } catch (err) {
      console.error('Auth middleware error:', err.message);
      
      let details = 'Invalid authentication token';
      if (err.name === 'TokenExpiredError') {
        details = 'Your authentication token has expired. Please log in again.';
      } else if (err.name === 'JsonWebTokenError') {
        details = 'Malformed authentication token. Please log in again.';
      }
      
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route',
        details: details
      });
    }
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      details: 'Internal error processing authentication'
    });
  }
};

// Token refresh utility
exports.refreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};
