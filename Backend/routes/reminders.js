const express = require('express');
const router = express.Router();
const {
  createReminder,
  getReminders,
  getUpcomingReminders,
  getReminder,
  updateReminder,
  deleteReminder,
  completeReminder
} = require('../controllers/reminderController');

// Import auth middleware
const auth = require('../middleware/auth');

// Set auth middleware for all routes
router.use(auth);

// Routes for /api/reminders
router.route('/')
  .get(getReminders)
  .post(createReminder);

// Route for upcoming reminders
router.route('/upcoming')
  .get(getUpcomingReminders);

// Routes for /api/reminders/:id
router.route('/:id')
  .get(getReminder)
  .put(updateReminder)
  .delete(deleteReminder);

// Route for completing a reminder
router.route('/:id/complete')
  .put(completeReminder);

module.exports = router;
