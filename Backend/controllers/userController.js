const User = require('../models/User');
const Plant = require('../models/Plant');
const Reminder = require('../models/Reminder');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { name, location, preferences, avatar } = req.body;
    
    console.log('Updating profile for user:', req.user.id);
    console.log('Update data:', { 
      name, 
      location, 
      preferences, 
      avatar: avatar ? 'Avatar data present' : 'No avatar' 
    });
    
    // Build update object with only the fields that are provided
    const updateFields = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (location !== undefined) updateFields.location = location.trim();
    if (preferences !== undefined) updateFields.preferences = { ...preferences };
    if (avatar !== undefined) updateFields.avatar = avatar;
    
    // Validate name if provided
    if (name && (name.trim().length === 0 || name.length > 50)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name must be between 1 and 50 characters' 
      });
    }
    
    // Validate location if provided
    if (location && location.length > 100) {
      return res.status(400).json({ 
        success: false, 
        error: 'Location cannot be more than 100 characters' 
      });
    }
    
    // Validate avatar size (base64 data should not be too large)
    if (avatar && avatar.length > 10 * 1024 * 1024) { // ~7.5MB base64 = ~10MB file
      return res.status(400).json({ 
        success: false, 
        error: 'Avatar image is too large. Please use an image smaller than 5MB.' 
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    console.log('Profile updated successfully for user:', req.user.id);
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    console.error('Profile update error:', err.message);
    
    // Handle validation errors
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

// @desc    Update user password
// @route   PUT /api/users/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Check if passwords are provided
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide current and new password' 
      });
    }
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Check if current password is correct
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: { message: 'Password updated successfully' }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res, next) => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    // Get plant count
    const plantCount = await Plant.countDocuments({
      user: req.user.id
    });
    
    const reminderCount = await Reminder.countDocuments({
      user: req.user.id,
      completed: false,
      scheduledDate: { $gte: today, $lte: nextWeek }
    });
    
    // Count plants that need watering
    const needsWateringCount = await Plant.countDocuments({
      user: req.user.id,
      $or: [
        { lastWatered: { $exists: false } },
        {
          $expr: {
            $gte: [
              { $subtract: [new Date(), '$lastWatered'] },
              { $multiply: ['$wateringFrequency', 24 * 60 * 60 * 1000] }
            ]
          }
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalPlants: plantCount,
        upcomingReminders: reminderCount,
        plantsNeedingWater: needsWateringCount
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    // Delete all related data first
    await Promise.all([
      Plant.deleteMany({ user: req.user.id }),
      Reminder.deleteMany({ user: req.user.id })
    ]);
    
    // Delete user account
    await User.findByIdAndDelete(req.user.id);
    
    res.status(200).json({
      success: true,
      data: { message: 'Account and all associated data deleted successfully' }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
