const axios = require('axios');
const User = require('../models/User');

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
    
    // Call OpenWeatherMap API
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'Weather API key not configured on server' 
      });
    }
    
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`
    );
    
    const weatherData = {
      location: weatherResponse.data.name,
      country: weatherResponse.data.sys.country,
      temperature: weatherResponse.data.main.temp,
      feels_like: weatherResponse.data.main.feels_like,
      humidity: weatherResponse.data.main.humidity,
      description: weatherResponse.data.weather[0].description,
      icon: weatherResponse.data.weather[0].icon,
      wind_speed: weatherResponse.data.wind.speed,
      clouds: weatherResponse.data.clouds.all,
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      data: weatherData
    });
  } catch (err) {
    console.error('Weather API Error:', err.message);
    
    // Check if it's an API error response
    if (err.response && err.response.data) {
      return res.status(err.response.status || 500).json({
        success: false,
        error: `Weather service error: ${err.response.data.message || 'Unknown error'}`
      });
    }
    
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
    
    // Call OpenWeatherMap API for current weather
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'Weather API key not configured on server' 
      });
    }
    
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`
    );
    
    // Generate recommendations based on weather conditions
    const weather = weatherResponse.data;
    const temp = weather.main.temp;
    const humidity = weather.main.humidity;
    const windSpeed = weather.wind.speed;
    const description = weather.weather[0].description.toLowerCase();
    
    let recommendations = {
      watering: null,
      sunlight: null,
      general: null
    };
    
    // Watering recommendations
    if (humidity < 30) {
      recommendations.watering = "The air is very dry. Consider increasing watering frequency and misting your plants.";
    } else if (humidity > 70) {
      recommendations.watering = "The air is humid. Be careful not to overwater your plants.";
    } else {
      recommendations.watering = "Current humidity levels are moderate. Maintain your regular watering schedule.";
    }
    
    // Sunlight recommendations
    if (description.includes('clear') || description.includes('sunny')) {
      recommendations.sunlight = "It's sunny today! A good day to give your sun-loving plants some natural light.";
    } else if (description.includes('cloud') || description.includes('overcast')) {
      recommendations.sunlight = "It's cloudy today. Your shade plants will be comfortable, but sun-loving plants might need supplemental light.";
    } else if (description.includes('rain') || description.includes('drizzle')) {
      recommendations.sunlight = "It's rainy today. Keep plants that don't like wet leaves away from open windows.";
    }
    
    // General recommendations
    if (temp > 30) {
      recommendations.general = "It's very hot! Keep plants away from hot windows and consider increasing humidity and watering.";
    } else if (temp < 5) {
      recommendations.general = "It's cold! Keep plants away from drafty windows and cold spots.";
    } else if (windSpeed > 8) {
      recommendations.general = "It's windy today! If you have plants outside, consider moving them to a sheltered location.";
    } else {
      recommendations.general = "Weather conditions are favorable for most plants today.";
    }
    
    res.status(200).json({
      success: true,
      data: {
        weather: {
          temperature: temp,
          humidity,
          windSpeed,
          description: weather.weather[0].description,
        },
        recommendations
      }
    });
  } catch (err) {
    console.error('Weather Recommendations Error:', err.message);
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
    
    // Call OpenWeatherMap API for 5-day forecast
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'Weather API key not configured on server' 
      });
    }
    
    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${apiKey}`
    );
    
    // Process and simplify the forecast data
    const processedForecast = forecastResponse.data.list.map(item => ({
      time: item.dt_txt,
      temperature: item.main.temp,
      humidity: item.main.humidity,
      conditions: item.weather[0].description,
      icon: item.weather[0].icon
    }));
    
    res.status(200).json({
      success: true,
      location: forecastResponse.data.city.name,
      country: forecastResponse.data.city.country,
      data: processedForecast
    });
  } catch (err) {
    console.error('Weather Forecast Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch weather forecast' });
  }
};
