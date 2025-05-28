const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { sendReminderEmail } = require('./emailService');

/**
 * Initializes all cron jobs for plant care reminders
 */
const initCronJobs = () => {
  console.log('Initializing reminder cron jobs...');
  
  // Validate that we can create a cron job first
  try {
    // Test cron pattern validity
    if (!cron.validate('0 * * * *')) {
      console.error('Invalid cron pattern detected');
      return;
    }
    
    // Run every 5 minutes to check for due reminders (more frequent for better UX)
    cron.schedule('*/5 * * * *', async () => {
      try {
        console.log('Running reminder check...');
        const currentTime = new Date();
        
        // Find reminders that are due - with proper date validation
        const dueReminders = await Reminder.find({
          $or: [
            { nextReminder: { $lte: currentTime, $ne: null } },
            { scheduledDate: { $lte: currentTime } }
          ],
          active: true,
          completed: false
        }).populate('plant').populate('user');
        
        console.log(`Found ${dueReminders.length} due reminders`);
        
        // Process each reminder
        for (const reminder of dueReminders) {
          try {
            // Validate reminder has required data
            if (!reminder.user || !reminder.plant) {
              console.warn(`Skipping reminder ${reminder._id} - missing user or plant data`);
              continue;
            }
            
            // Send email notification if enabled
            if (reminder.notificationMethods.includes('email') && reminder.user.email) {
              await sendReminderEmail(
                reminder.user.email,
                reminder,
                reminder.plant
              );
              console.log(`Sent reminder email to ${reminder.user.email} for plant: ${reminder.plant.name}`);
            }
            
            // Don't mark as sent here - let the frontend notification system handle it
            // This allows the due reminders endpoint to pick them up
            
            console.log(`Processed reminder for ${reminder.plant.name}`);
            
          } catch (reminderError) {
            console.error(`Error processing individual reminder ${reminder._id}:`, reminderError.message);
          }
        }
        
        console.log(`Processed ${dueReminders.length} reminders successfully`);
      } catch (error) {
        console.error('Error in reminder cron job:', error.message);
      }
    }, {
      scheduled: true,
      timezone: "UTC"
    });
    
    console.log('✅ Reminder cron jobs initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize cron jobs:', error.message);
  }
};

/**
 * Calculate the next reminder date based on reminder frequency
 * @param {Object} reminder - The reminder object
 * @returns {Date|null} - The next reminder date or null if invalid
 */
const calculateNextReminderDate = (reminder) => {
  try {
    // Use scheduledDate as base if nextReminder is invalid
    let baseDate = reminder.nextReminder;
    if (!baseDate || isNaN(new Date(baseDate).getTime())) {
      baseDate = reminder.scheduledDate;
    }
    
    // If both dates are invalid, use current time
    if (!baseDate || isNaN(new Date(baseDate).getTime())) {
      baseDate = new Date();
    }
    
    const nextDate = new Date(baseDate);
    
    // Validate the base date
    if (isNaN(nextDate.getTime())) {
      console.error('Invalid base date for reminder calculation');
      return null;
    }
    
    switch (reminder.frequency) {
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
        // For custom frequencies (stored in days)
        const days = parseInt(reminder.frequency) || 7; // Default to 7 days
        nextDate.setDate(nextDate.getDate() + days);
    }
    
    // Validate the calculated date
    if (isNaN(nextDate.getTime())) {
      console.error('Calculated date is invalid');
      return null;
    }
    
    return nextDate;
  } catch (error) {
    console.error('Error calculating next reminder date:', error.message);
    return null;
  }
};

// Export the initCronJobs function
module.exports = initCronJobs;
