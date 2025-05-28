const express = require('express');
const router = express.Router();
const {
  createReminder,
  getReminders,
  getUpcomingReminders,
  getDueReminders,
  getReminder,
  updateReminder,
  deleteReminder,
  completeReminder,
  markNotificationSent
} = require('../controllers/reminderController');

// Import auth middleware - FIX: Import the destructured protect function
const { protect } = require('../middleware/auth');

// Set auth middleware for all routes
router.use(protect);

// Routes for /api/reminders
router.route('/')
  .get(getReminders)
  .post(createReminder);

// Route for upcoming reminders
router.route('/upcoming')
  .get(getUpcomingReminders);

// Route for due reminders
router.route('/due')
  .get(getDueReminders);

// Routes for /api/reminders/:id
router.route('/:id')
  .get(getReminder)
  .put(updateReminder)
  .delete(deleteReminder);

// Route for completing a reminder
router.route('/:id/complete')
  .put(completeReminder);

// Route for marking notification as sent
router.route('/:id/notification-sent')
  .put(markNotificationSent);

module.exports = router;
