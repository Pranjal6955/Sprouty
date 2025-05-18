const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies if not in headers
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Check token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request object
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not found with this token'
      });
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

// We're keeping the exports object as is
