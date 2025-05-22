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
    
    try {
      const weatherData = await weatherService.getCurrentWeather(location);
      
      res.status(200).json({
        success: true,
        data: weatherData
      });
      
    } catch (apiError) {
      // Return mock data as fallback when API fails
      const mockWeatherData = {
        location: location,
        country: "Unknown",
        temperature: 22,
        feels_like: 24,
        humidity: 65,
        description: "partly cloudy",
        icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
        wind_speed: 3.5,
        wind_direction: "SW",
        pressure: 1013,
        visibility: 10,
        uv: 6,
        clouds: 40,
        timestamp: new Date().toISOString(),
        localtime: new Date().toISOString()
      };
      
      res.status(200).json({
        success: true,
        data: mockWeatherData,
        note: "Using mock data - Weather API temporarily unavailable"
      });
    }
    
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch weather data' });
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
    
    try {
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
      
    } catch (apiError) {
      // Use mock data as fallback
      const mockWeatherData = {
        temperature: 22,
        humidity: 65,
        wind_speed: 3.5,
        description: "partly cloudy",
        uv: 6
      };
      
      const mockRecommendations = weatherService.generateRecommendations(mockWeatherData);
      
      res.status(200).json({
        success: true,
        data: {
          weather: mockWeatherData,
          recommendations: mockRecommendations
        },
        note: "Using mock data - Weather API temporarily unavailable"
      });
    }
    
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to generate weather recommendations' });
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
    
    try {
      const forecastData = await weatherService.getWeatherForecast(location, days);
      
      res.status(200).json({
        success: true,
        location: forecastData.location,
        country: forecastData.country,
        data: forecastData.forecast
      });
      
    } catch (apiError) {
      // Return mock forecast as fallback
      const mockForecast = [
        { time: new Date().toISOString().slice(0, 19).replace('T', ' '), temperature: 22, humidity: 65, conditions: "Partly cloudy", icon: "//cdn.weatherapi.com/weather/64x64/day/116.png" },
        { time: new Date(Date.now() + 3*60*60*1000).toISOString().slice(0, 19).replace('T', ' '), temperature: 24, humidity: 60, conditions: "Clear", icon: "//cdn.weatherapi.com/weather/64x64/day/113.png" },
        { time: new Date(Date.now() + 6*60*60*1000).toISOString().slice(0, 19).replace('T', ' '), temperature: 20, humidity: 70, conditions: "Cloudy", icon: "//cdn.weatherapi.com/weather/64x64/day/119.png" },
        { time: new Date(Date.now() + 12*60*60*1000).toISOString().slice(0, 19).replace('T', ' '), temperature: 18, humidity: 75, conditions: "Light rain", icon: "//cdn.weatherapi.com/weather/64x64/day/296.png" },
        { time: new Date(Date.now() + 24*60*60*1000).toISOString().slice(0, 19).replace('T', ' '), temperature: 25, humidity: 55, conditions: "Sunny", icon: "//cdn.weatherapi.com/weather/64x64/day/113.png" }
      ];
      
      res.status(200).json({
        success: true,
        location: location,
        country: "Unknown",
        data: mockForecast,
        note: "Using mock forecast data - Weather API temporarily unavailable"
      });
    }
    
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch weather forecast' });
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
    
    try {
      const suggestions = await weatherService.searchLocations(query);
      
      res.status(200).json({
        success: true,
        data: suggestions
      });
      
    } catch (apiError) {
      // Return mock suggestions as fallback
      const mockSuggestions = [
        { 
          name: query, 
          region: 'Unknown', 
          country: 'Unknown', 
          displayName: `${query}, Unknown, Unknown`,
          lat: 0,
          lon: 0
        }
      ];
      
      res.status(200).json({
        success: true,
        data: mockSuggestions,
        note: "Using mock data - Weather API temporarily unavailable"
      });
    }
    
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to search locations' });
  }
};
