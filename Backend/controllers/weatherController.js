const axios = require('axios');
const User = require('../models/User');
const weatherService = require('../services/weatherService');

// @desc    Get weather data for user's location
// @route   GET /api/weather
// @access  Private
exports.getWeatherData = async (req, res, next) => {
  try {
    // Get user to check their saved location
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Get location from query, user profile, or default
    const location = req.query.location || user.location || 'New York';
    
    const weatherData = await weatherService.getCurrentWeather(location);
    
    res.status(200).json({
      success: true,
      data: weatherData
    });
    
  } catch (err) {
    console.error('Weather API Error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Weather service temporarily unavailable. Please try again later.' 
    });
  }
};

// @desc    Get plant care recommendations based on weather
// @route   GET /api/weather/recommendations
// @access  Private
exports.getWeatherRecommendations = async (req, res, next) => {
  try {
    // Get location from query, or user profile
    let location;
    if (req.query.location) {
      location = req.query.location;
    } else {
      const user = await User.findById(req.user.id);
      location = user.location || 'New York';
    }
    
    const weatherData = await weatherService.getCurrentWeather(location);
    const recommendations = weatherService.generateRecommendations(weatherData);
    
    const responseData = {
      weather: {
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        windSpeed: weatherData.wind_speed,
        description: weatherData.description,
        uv: weatherData.uv
      },
      recommendations
    };
    
    res.status(200).json({
      success: true,
      data: responseData
    });
    
  } catch (err) {
    console.error('Weather Recommendations Error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Weather recommendations service temporarily unavailable. Please try again later.' 
    });
  }
};

// @desc    Get forecast data for planning ahead
// @route   GET /api/weather/forecast
// @access  Private
exports.getWeatherForecast = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get location from query, user profile, or default
    const location = req.query.location || user.location || 'New York';
    const days = parseInt(req.query.days) || 3;
    
    const forecastData = await weatherService.getWeatherForecast(location, days);
    
    res.status(200).json({
      success: true,
      location: forecastData.location,
      country: forecastData.country,
      data: forecastData.forecast
    });
    
  } catch (err) {
    console.error('Weather Forecast Error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Weather forecast service temporarily unavailable. Please try again later.' 
    });
  }
};

// @desc    Search for location suggestions
// @route   GET /api/weather/search
// @access  Private
exports.searchLocations = async (req, res, next) => {
  try {
    const query = req.query.q;
    
    if (!query || query.length < 2) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    const suggestions = await weatherService.searchLocations(query);
    
    res.status(200).json({
      success: true,
      data: suggestions
    });
    
  } catch (err) {
    console.error('Location Search Error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Location search service temporarily unavailable. Please try again later.' 
    });
  }
};
