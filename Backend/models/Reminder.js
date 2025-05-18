const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  plant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Plant',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Watering', 'Fertilizing', 'Pruning', 'Repotting', 'Custom'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedDate: {
    type: Date
  },
  recurring: {
    type: Boolean,
    default: true
  },
  frequency: {
    type: Number, // days between reminders
    default: 7
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create index on scheduledDate for efficient querying
ReminderSchema.index({ scheduledDate: 1 });

// Method to reschedule based on frequency after completion
ReminderSchema.methods.reschedule = function() {
  if (this.recurring && this.completed) {
    const newDate = new Date(this.completedDate || Date.now());
    newDate.setDate(newDate.getDate() + this.frequency);
    
    this.scheduledDate = newDate;
    this.completed = false;
    this.notificationSent = false;
    this.completedDate = undefined;
    
    return true;
  }
  return false;
};

module.exports = mongoose.model('Reminder', ReminderSchema);