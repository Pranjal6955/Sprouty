const cron = require('node-cron');
const Reminder = require('../models/Reminder'); // Adjust path if different
const User = require('../models/User'); // Adjust path if different
const { sendEmail } = require('./emailService'); // Adjust path if needed

/**
 * Initializes all cron jobs for plant care reminders
 */
const initCronJobs = () => {
  console.log('Initializing reminder cron jobs...');
  
  // Run every hour to check for due reminders
  cron.schedule('0 * * * *', async () => {
    try {
      const currentTime = new Date();
      // Find reminders that are due
      const dueReminders = await Reminder.find({
        nextReminder: { $lte: currentTime },
        active: true
      }).populate('plant').populate('user');
      
      // Process each reminder
      for (const reminder of dueReminders) {
        // Send notification to user
        if (reminder.user && reminder.user.email) {
          await sendEmail(
            reminder.user.email,
            `Time to care for your ${reminder.plant.name}!`,
            `Don't forget to ${reminder.type} your plant.`
          );
        }
        
        // Update next reminder date based on frequency
        reminder.nextReminder = calculateNextReminderDate(reminder);
        await reminder.save();
      }
      
      console.log(`Processed ${dueReminders.length} reminders`);
    } catch (error) {
      console.error('Error processing reminders:', error);
    }
  });
};

/**
 * Calculate the next reminder date based on reminder frequency
 */
const calculateNextReminderDate = (reminder) => {
  const nextDate = new Date(reminder.nextReminder);
  
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
      const days = parseInt(reminder.frequency) || 3;
      nextDate.setDate(nextDate.getDate() + days);
  }
  
  return nextDate;
};

// Export the initCronJobs function
module.exports = initCronJobs;
