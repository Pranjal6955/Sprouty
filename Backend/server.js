// server.js - Main entry point for the Virtual Plant Caretaker backend
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const plantRoutes = require('./routes/plants');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const reminderRoutes = require('./routes/reminders');
const weatherRoutes = require('./routes/weather');
const initCronJobs = require('./services/cronService');
const firebase = require('./config/firebase'); // Initialize Firebase Admin SDK
require('dotenv').config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Database cleanup function for invalid reminder dates
const cleanupInvalidReminders = async () => {
  try {
    const Reminder = require('./models/Reminder');
    
    // Find and fix reminders with invalid dates
    const invalidReminders = await Reminder.find({
      $or: [
        { nextReminder: { $type: "string" } }, // String dates that should be Date objects
        { scheduledDate: { $type: "string" } }
      ]
    });
    
    console.log(`Found ${invalidReminders.length} reminders with invalid dates, fixing...`);
    
    for (const reminder of invalidReminders) {
      try {
        // Fix scheduledDate if it's a string
        if (typeof reminder.scheduledDate === 'string') {
          const validDate = new Date(reminder.scheduledDate);
          if (!isNaN(validDate.getTime())) {
            reminder.scheduledDate = validDate;
          } else {
            // If can't parse, disable the reminder
            reminder.active = false;
            console.warn(`Disabled reminder ${reminder._id} due to invalid scheduledDate`);
          }
        }
        
        // Fix nextReminder if it's a string
        if (typeof reminder.nextReminder === 'string') {
          const validDate = new Date(reminder.nextReminder);
          if (!isNaN(validDate.getTime())) {
            reminder.nextReminder = validDate;
          } else {
            // Set to scheduledDate if valid, otherwise disable
            if (reminder.scheduledDate && !isNaN(new Date(reminder.scheduledDate).getTime())) {
              reminder.nextReminder = reminder.scheduledDate;
            } else {
              reminder.active = false;
              console.warn(`Disabled reminder ${reminder._id} due to invalid nextReminder`);
            }
          }
        }
        
        await reminder.save();
      } catch (err) {
        console.error(`Error fixing reminder ${reminder._id}:`, err.message);
      }
    }
    
    console.log('✅ Reminder cleanup completed');
  } catch (error) {
    console.error('❌ Error during reminder cleanup:', error.message);
  }
};

// Run cleanup before initializing cron jobs
cleanupInvalidReminders().then(() => {
  // Initialize cron jobs for reminders
  if (typeof initCronJobs === 'function') {
    initCronJobs();
  } else {
    console.error('Warning: initCronJobs is not a function. Cron jobs not initialized.');
  }
});

// Initialize Firebase Admin (already done via import)
console.log('Firebase Admin SDK initialized');

// Middleware
app.use(cors());

// Body parser with increased limit for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Debug each router
console.log('authRoutes type:', typeof authRoutes);
console.log('userRoutes type:', typeof userRoutes);
console.log('plantRoutes type:', typeof plantRoutes);
console.log('reminderRoutes type:', typeof reminderRoutes);
console.log('weatherRoutes type:', typeof weatherRoutes);

// Define Routes - with checks
if (typeof authRoutes === 'function') {
  app.use('/api/auth', authRoutes);
} else {
  console.error('Warning: authRoutes is not a function');
}

if (typeof userRoutes === 'function') {
  app.use('/api/users', userRoutes);
} else {
  console.error('Warning: userRoutes is not a function');
}

if (typeof plantRoutes === 'function') {
  app.use('/api/plants', plantRoutes);
} else {
  console.error('Warning: plantRoutes is not a function');
}

if (typeof reminderRoutes === 'function') {
  app.use('/api/reminders', reminderRoutes);
} else {
  console.error('Warning: reminderRoutes is not a function');
}

if (typeof weatherRoutes === 'function') {
  app.use('/api/weather', weatherRoutes);
} else {
  console.error('Warning: weatherRoutes is not a function');
}

// Base route
app.get('/', (req, res) => {
  res.send('Virtual Plant Caretaker API is running');
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // For testing purposes