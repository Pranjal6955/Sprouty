const Reminder = require('../models/Reminder');
const Plant = require('../models/Plant');

// @desc    Create new reminder
// @route   POST /api/reminders
// @access  Private
exports.createReminder = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    
    // Validate required dates
    if (!req.body.scheduledDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'scheduledDate is required' 
      });
    }
    
    // Validate date format
    const scheduledDate = new Date(req.body.scheduledDate);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid scheduledDate format' 
      });
    }
    
    // Set nextReminder to scheduledDate for recurring reminders
    if (req.body.recurring !== false) { // Default to true if not specified
      req.body.nextReminder = scheduledDate;
    }
    
    // Check if plant exists and belongs to user
    const plant = await Plant.findById(req.body.plant);
    
    if (!plant) {
      return res.status(404).json({ success: false, error: 'Plant not found' });
    }
    
    // Make sure user owns plant
    if (plant.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to set reminders for this plant' });
    }
    
    const reminder = await Reminder.create(req.body);
    
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
    const reminders = await Reminder.find({ user: req.user.id })
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
