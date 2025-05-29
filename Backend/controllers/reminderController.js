const Reminder = require('../models/Reminder');
const Plant = require('../models/Plant');

// @desc    Create new reminder
// @route   POST /api/reminders
// @access  Private
exports.createReminder = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    
    // Map frontend data to backend schema
    const reminderData = {
      user: req.user.id,
      plant: req.body.plant,
      type: req.body.type,
      title: req.body.title || `${req.body.type} reminder`,
      notes: req.body.notes,
      scheduledDate: new Date(req.body.scheduledDate),
      recurring: req.body.recurring !== false,
      frequency: req.body.frequency || 'weekly',
      notificationMethods: req.body.notificationMethods || ['popup']
    };
    
    // Validate required dates
    if (!reminderData.scheduledDate || isNaN(reminderData.scheduledDate.getTime())) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid scheduledDate is required' 
      });
    }
    
    // Set nextReminder to scheduledDate for recurring reminders
    if (reminderData.recurring) {
      reminderData.nextReminder = reminderData.scheduledDate;
    }
    
    // Check if plant exists and belongs to user
    const plant = await Plant.findById(reminderData.plant);
    
    if (!plant) {
      return res.status(404).json({ success: false, error: 'Plant not found' });
    }
    
    // Make sure user owns plant
    if (plant.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to set reminders for this plant' });
    }
    
    const reminder = await Reminder.create(reminderData);
    
    // Populate plant data for response
    await reminder.populate('plant', 'name nickname species mainImage');
    
    res.status(201).json({
      success: true,
      data: reminder
    });
  } catch (err) {
    console.error('Error creating reminder:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get all reminders for user
// @route   GET /api/reminders
// @access  Private
exports.getReminders = async (req, res, next) => {
  try {
    const reminders = await Reminder.find({ 
      user: req.user.id,
      active: true 
    })
    .populate({
      path: 'plant',
      select: 'name nickname species mainImage'
    })
    .sort({ scheduledDate: 1 });
    
    console.log(`Found ${reminders.length} reminders for user ${req.user.id}`);
    
    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (err) {
    console.error('Error fetching reminders:', err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get upcoming reminders
// @route   GET /api/reminders/upcoming
// @access  Private
exports.getUpcomingReminders = async (req, res, next) => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const reminders = await Reminder.find({
      user: req.user.id,
      completed: false,
      scheduledDate: { $gte: today, $lte: nextWeek }
    }).sort({ scheduledDate: 1 })
      .populate({
        path: 'plant',
        select: 'name images mainImage'
      });
    
    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get single reminder
// @route   GET /api/reminders/:id
// @access  Private
exports.getReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findById(req.params.id).populate({
      path: 'plant',
      select: 'name images mainImage'
    });
    
    if (!reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }
    
    // Make sure user owns reminder
    if (reminder.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this reminder' });
    }
    
    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update reminder
// @route   PUT /api/reminders/:id
// @access  Private
exports.updateReminder = async (req, res, next) => {
  try {
    let reminder = await Reminder.findById(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }
    
    // Make sure user owns reminder
    if (reminder.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this reminder' });
    }
    
    reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private
exports.deleteReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }
    
    // Make sure user owns reminder
    if (reminder.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this reminder' });
    }
    
    await reminder.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Mark reminder as completed
// @route   PUT /api/reminders/:id/complete
// @access  Private
exports.completeReminder = async (req, res, next) => {
  try {
    let reminder = await Reminder.findById(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }
    
    // Make sure user owns reminder
    if (reminder.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this reminder' });
    }
    
    reminder.completed = true;
    reminder.completedDate = new Date();
    
    // Find the associated plant and add to care history
    const plant = await Plant.findById(reminder.plant);
    if (plant) {
      // Add to plant's care history
      plant.careHistory.unshift({
        actionType: reminder.type === 'Water' ? 'Watered' : 
                    reminder.type === 'Fertilize' ? 'Fertilized' : 
                    reminder.type === 'Prune' ? 'Pruned' : 'Other',
        notes: reminder.notes || `${reminder.type} reminder completed`,
        date: reminder.completedDate
      });
      
      // Update last action dates based on type
      if (reminder.type === 'Water') {
        plant.lastWatered = reminder.completedDate;
      } else if (reminder.type === 'Fertilize') {
        plant.lastFertilized = reminder.completedDate;
      } else if (reminder.type === 'Prune') {
        plant.lastPruned = reminder.completedDate;
      }
      
      await plant.save();
    }
    
    // If recurring reminder, reschedule it
    if (reminder.recurring) {
      const rescheduled = reminder.reschedule();
      if (!rescheduled) {
        console.warn(`Failed to reschedule reminder ${reminder._id}, marking as non-recurring`);
        reminder.recurring = false;
      }
    }
    
    await reminder.save();
    
    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (err) {
    console.error('Error completing reminder:', err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get reminder statistics for dashboard
// @route   GET /api/reminders/stats
// @access  Private
exports.getReminderStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Get various reminder counts
    const [
      totalActive,
      dueToday,
      dueTomorrow,
      dueThisWeek,
      overdue,
      completedThisWeek
    ] = await Promise.all([
      Reminder.countDocuments({ user: userId, active: true, completed: false }),
      Reminder.countDocuments({ 
        user: userId, 
        active: true, 
        completed: false,
        scheduledDate: { $gte: today, $lt: tomorrow }
      }),
      Reminder.countDocuments({ 
        user: userId, 
        active: true, 
        completed: false,
        scheduledDate: { $gte: tomorrow, $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000) }
      }),
      Reminder.countDocuments({ 
        user: userId, 
        active: true, 
        completed: false,
        scheduledDate: { $gte: today, $lt: nextWeek }
      }),
      Reminder.countDocuments({ 
        user: userId, 
        active: true, 
        completed: false,
        scheduledDate: { $lt: today }
      }),
      Reminder.countDocuments({ 
        user: userId, 
        completed: true,
        completedDate: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    // Get reminder type distribution
    const typeStats = await Reminder.aggregate([
      { $match: { user: req.user._id, active: true, completed: false } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalActive,
        dueToday,
        dueTomorrow,
        dueThisWeek,
        overdue,
        completedThisWeek,
        typeDistribution: typeStats
      }
    });
  } catch (err) {
    console.error('Error getting reminder stats:', err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Enhanced getDueReminders with better filtering
exports.getDueReminders = async (req, res, next) => {
  try {
    const currentTime = new Date();
    const fiveMinutesFromNow = new Date(currentTime.getTime() + 5 * 60 * 1000);
    
    const dueReminders = await Reminder.find({
      user: req.user.id,
      active: true,
      completed: false,
      $or: [
        { nextReminder: { $lte: fiveMinutesFromNow } },
        { scheduledDate: { $lte: fiveMinutesFromNow } }
      ]
    }).populate({
      path: 'plant',
      select: 'name nickname species mainImage'
    }).sort({ scheduledDate: 1 });
    
    // Enhanced filtering logic
    const recentlyNotified = new Date(currentTime.getTime() - 15 * 60 * 1000); // 15 minutes
    const filteredReminders = dueReminders.filter(reminder => {
      // Skip if recently notified
      if (reminder.notificationSent && reminder.updatedAt > recentlyNotified) {
        return false;
      }
      
      // Include if it's actually due or will be due soon
      const reminderTime = new Date(reminder.nextReminder || reminder.scheduledDate);
      return reminderTime <= fiveMinutesFromNow;
    });
    
    if (filteredReminders.length > 0) {
      console.log(`Found ${filteredReminders.length} due reminders for user ${req.user.id}`);
    }
    
    res.status(200).json({
      success: true,
      count: filteredReminders.length,
      data: filteredReminders
    });
  } catch (err) {
    console.error('Error getting due reminders:', err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Mark reminder notification as sent
// @route   PUT /api/reminders/:id/notification-sent
// @access  Private
exports.markNotificationSent = async (req, res, next) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }
    
    if (reminder.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    
    reminder.notificationSent = true;
    await reminder.save();
    
    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (err) {
    console.error('Error marking notification sent:', err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
