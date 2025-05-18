const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getWeatherData,
  getWeatherRecommendations,
  getWeatherForecast
} = require('../controllers/weatherController');

// Weather routes
router.get('/', protect, getWeatherData);
router.get('/recommendations', protect, getWeatherRecommendations);
router.get('/forecast', protect, getWeatherForecast);

module.exports = router;
