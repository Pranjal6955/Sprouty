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
    enum: ['Water', 'Fertilize', 'Prune', 'Repot', 'Custom'], // Match frontend enum
    required: true
  },
  title: {
    type: String,
    required: function() {
      return !this.plant; // Only required if no plant reference
    }
  },
  notes: {
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
  },
  nextReminder: {
    type: Date,
    required: function() {
      return this.active && this.recurring;
    },
    validate: {
      validator: function(v) {
        return v === null || v === undefined || !isNaN(new Date(v).getTime());
      },
      message: 'nextReminder must be a valid date'
    }
  },
  notificationMethods: {
    type: [String],
    enum: ['email', 'push', 'popup'],
    default: ['popup']
  }
}, {
  timestamps: true
});

// Create index on scheduledDate for efficient querying
ReminderSchema.index({ scheduledDate: 1 });

// Method to reschedule based on frequency after completion
ReminderSchema.methods.reschedule = function() {
  if (this.recurring && this.completed) {
    try {
      const baseDate = this.completedDate || new Date();
      const nextDate = new Date(baseDate);
      
      // Validate base date
      if (isNaN(nextDate.getTime())) {
        console.error('Invalid base date for rescheduling');
        return false;
      }
      
      switch (this.frequency) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'biweekly':
          nextDate.setDate(nextDate.getDate() + 14);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        default:
          const days = parseInt(this.frequency) || 7;
          nextDate.setDate(nextDate.getDate() + days);
      }
      
      // Validate calculated date
      if (isNaN(nextDate.getTime())) {
        console.error('Calculated reschedule date is invalid');
        return false;
      }
      
      this.scheduledDate = nextDate;
      this.nextReminder = nextDate;
      this.completed = false;
      this.notificationSent = false;
      this.completedDate = undefined;
      
      return true;
    } catch (error) {
      console.error('Error rescheduling reminder:', error.message);
      return false;
    }
  }
  return false;
};

// Pre-save middleware to set nextReminder if not set
ReminderSchema.pre('save', function(next) {
  try {
    // Set nextReminder to scheduledDate if not set and reminder is active
    if (this.active && this.recurring && !this.nextReminder) {
      if (this.scheduledDate && !isNaN(new Date(this.scheduledDate).getTime())) {
        this.nextReminder = this.scheduledDate;
      }
    }
    
    // Validate dates before saving
    if (this.nextReminder && isNaN(new Date(this.nextReminder).getTime())) {
      return next(new Error('Invalid nextReminder date'));
    }
    
    if (this.scheduledDate && isNaN(new Date(this.scheduledDate).getTime())) {
      return next(new Error('Invalid scheduledDate'));
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Reminder', ReminderSchema);