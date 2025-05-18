const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  updateUserProfile, 
  updatePassword, 
  getUserStats, 
  deleteAccount 
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All routes need authentication
router.use(protect);

// User profile routes
router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

// Password update route
router.put('/password', updatePassword);

// User stats route
router.get('/stats', getUserStats);

// Delete account route
router.delete('/', deleteAccount);

module.exports = router;
