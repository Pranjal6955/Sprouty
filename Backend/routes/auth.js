const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword,
  verifyToken // Add the new controller function
} = require('../controllers/authController');

// Middleware for protected routes
const { protect } = require('../middleware/auth');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
// Add a token verification endpoint that will help users debug token issues
router.get('/verify-token', protect, verifyToken);

module.exports = router;
