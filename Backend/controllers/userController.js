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
    
    // Build update object with only the fields that are provided
    const updateFields = {};
    if (name) updateFields.name = name;
    if (location) updateFields.location = location;
    if (preferences) updateFields.preferences = { ...preferences };
    if (avatar) updateFields.avatar = avatar;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    
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
    // Count total plants
    const plantCount = await Plant.countDocuments({ user: req.user.id });
    
    // Count upcoming reminders
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
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
