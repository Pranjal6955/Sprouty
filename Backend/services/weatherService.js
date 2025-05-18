const axios = require('axios');

// OpenWeatherMap API base URL
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Get current weather data for a location
 * @param {string} location - City name or coordinates
 * @param {string} units - Units of measurement (metric, imperial, standard)
 * @returns {Promise<object>} - Weather data
 */
exports.getCurrentWeather = async (location, units = 'metric') => {
  try {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    
    if (!apiKey) {
      throw new Error('Weather API key not configured');
    }
    
    const response = await axios.get(`${API_BASE_URL}/weather`, {
      params: {
        q: location,
        units,
        appid: apiKey
      }
    });
    
    return {
      location: response.data.name,
      country: response.data.sys.country,
      temperature: response.data.main.temp,
      feels_like: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      wind_speed: response.data.wind.speed,
      clouds: response.data.clouds.all,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Weather service error:', error);
    throw error;
  }
};

/**
 * Get weather forecast for a location
 * @param {string} location - City name or coordinates
 * @param {string} units - Units of measurement (metric, imperial, standard)
 * @returns {Promise<object>} - Forecast data
 */
exports.getForecast = async (location, units = 'metric') => {
  try {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    
    if (!apiKey) {
      throw new Error('Weather API key not configured');
    }
    
    const response = await axios.get(`${API_BASE_URL}/forecast`, {
      params: {
        q: location,
        units,
        appid: apiKey
      }
    });
    
    // Process and simplify the forecast data
    const processedForecast = response.data.list.map(item => ({
      time: item.dt_txt,
      temperature: item.main.temp,
      humidity: item.main.humidity,
      conditions: item.weather[0].description,
      icon: item.weather[0].icon
    }));
    
    return {
      location: response.data.city.name,
      country: response.data.city.country,
      forecast: processedForecast
    };
  } catch (error) {
    console.error('Weather forecast error:', error);
    throw error;
  }
};

/**
 * Generate plant care recommendations based on weather conditions
 * @param {object} weatherData - Current weather data
 * @returns {object} - Care recommendations
 */
exports.generateRecommendations = (weatherData) => {
  const temp = weatherData.temperature;
  const humidity = weatherData.humidity;
  const windSpeed = weatherData.wind_speed;
  const description = weatherData.description.toLowerCase();
  
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
  
  return recommendations;
};
