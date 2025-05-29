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
const diagnosisRoutes = require('./routes/diagnosisRoutes');
const initCronJobs = require('./services/cronService');
require('dotenv').config();

// Check for required environment variables
console.log('🔍 Checking environment variables...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI available:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
console.log('WEATHER_API_KEY available:', !!process.env.WEATHER_API_KEY);

if (!process.env.PLANT_ID_API_KEY) {
  console.warn('⚠️  Warning: PLANT_ID_API_KEY not found in environment variables');
  console.warn('   Plant disease diagnosis features will use mock data');
  console.warn('   To enable real diagnosis, add PLANT_ID_API_KEY to your .env file');
  console.warn('   Get your API key from: https://web.plant.id/');
} else {
  console.log('✅ Plant.ID API key found - disease diagnosis enabled');
  // Test the API key format
  const apiKey = process.env.PLANT_ID_API_KEY;
  if (apiKey.length < 20) {
    console.warn('⚠️  Warning: Plant.ID API key seems too short, please verify it');
  }
}

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

// Middleware
app.use(cors({
  origin: ['https://frontend-sprouty.vercel.app/', 'http://localhost:5173'],
  credentials: true
}));

// Body parser with increased limit for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Debug each router
console.log('authRoutes type:', typeof authRoutes);
console.log('userRoutes type:', typeof userRoutes);
console.log('plantRoutes type:', typeof plantRoutes);
console.log('reminderRoutes type:', typeof reminderRoutes);
console.log('weatherRoutes type:', typeof weatherRoutes);
console.log('diagnosisRoutes type:', typeof diagnosisRoutes);

// Validate that all services are loaded properly
console.log('🔍 Validating services...');
console.log('Auth routes loaded:', typeof authRoutes === 'function');
console.log('User routes loaded:', typeof userRoutes === 'function');
console.log('Plant routes loaded:', typeof plantRoutes === 'function');
console.log('Reminder routes loaded:', typeof reminderRoutes === 'function');
console.log('Weather routes loaded:', typeof weatherRoutes === 'function');
console.log('Diagnosis routes loaded:', typeof diagnosisRoutes === 'function');

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

if (typeof diagnosisRoutes === 'function') {
  app.use('/api/diagnosis', diagnosisRoutes);
} else {
  console.error('Warning: diagnosisRoutes is not a function');
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