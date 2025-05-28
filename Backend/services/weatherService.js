const axios = require('axios');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_URL = process.env.WEATHER_API_URL || 'https://api.weatherapi.com/v1';

/**
 * Get current weather data from WeatherAPI.com
 * @param {string} location - Location to get weather for
 * @returns {Promise<object>} Weather data
 */
exports.getCurrentWeather = async (location) => {
  try {
    if (!WEATHER_API_KEY) {
      throw new Error('Weather API key not configured');
    }

    const response = await axios.get(`${WEATHER_API_URL}/current.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: location,
        aqi: 'no'
      }
    });

    const data = response.data;
    
    return {
      location: data.location.name,
      country: data.location.country,
      region: data.location.region,
      temperature: data.current.temp_c,
      feels_like: data.current.feelslike_c,
      humidity: data.current.humidity,
      description: data.current.condition.text,
      icon: data.current.condition.icon,
      wind_speed: data.current.wind_kph,
      wind_direction: data.current.wind_dir,
      pressure: data.current.pressure_mb,
      visibility: data.current.vis_km,
      uv: data.current.uv,
      clouds: data.current.cloud,
      timestamp: new Date().toISOString(),
      localtime: data.location.localtime
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get weather forecast from WeatherAPI.com
 * @param {string} location - Location to get forecast for
 * @param {number} days - Number of days to forecast (default: 3)
 * @returns {Promise<object>} Forecast data
 */
exports.getWeatherForecast = async (location, days = 3) => {
  try {
    if (!WEATHER_API_KEY) {
      throw new Error('Weather API key not configured');
    }

    const response = await axios.get(`${WEATHER_API_URL}/forecast.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: location,
        days: Math.min(days, 10), // WeatherAPI allows max 10 days
        aqi: 'no',
        alerts: 'no'
      }
    });

    const data = response.data;
    
    // Process forecast data
    const forecast = [];
    
    data.forecast.forecastday.forEach(day => {
      // Add daily summary
      forecast.push({
        date: day.date,
        time: `${day.date} 12:00:00`,
        temperature: day.day.avgtemp_c,
        max_temp: day.day.maxtemp_c,
        min_temp: day.day.mintemp_c,
        humidity: day.day.avghumidity,
        conditions: day.day.condition.text,
        icon: day.day.condition.icon,
        chance_of_rain: day.day.chance_of_rain,
        type: 'daily'
      });
      
      // Add hourly data for today and tomorrow
      if (forecast.length <= 2) {
        day.hour.forEach((hour, index) => {
          // Only include every 3 hours to avoid too much data
          if (index % 3 === 0) {
            forecast.push({
              date: day.date,
              time: hour.time,
              temperature: hour.temp_c,
              humidity: hour.humidity,
              conditions: hour.condition.text,
              icon: hour.condition.icon,
              chance_of_rain: hour.chance_of_rain,
              type: 'hourly'
            });
          }
        });
      }
    });

    return {
      location: data.location.name,
      country: data.location.country,
      region: data.location.region,
      forecast
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Generate plant care recommendations based on weather conditions
 * @param {object} weatherData - Current weather data
 * @returns {object} Care recommendations
 */
exports.generateRecommendations = (weatherData) => {
  // Extract weather variables from the data
  const { temperature: temp, humidity, description, uv } = weatherData;
  
  let recommendations = {
    watering: null,
    sunlight: null,
    general: null,
    protection: null
  };
  
  // Watering recommendations based on humidity and temperature
  if (humidity < 30 || temp > 30) {
    recommendations.watering = "The air is dry and/or hot. Consider increasing watering frequency and misting your plants.";
  } else if (humidity > 80) {
    recommendations.watering = "The air is very humid. Be careful not to overwater your plants and ensure good air circulation.";
  } else if (humidity > 70) {
    recommendations.watering = "The air is humid. Monitor soil moisture closely and reduce watering if needed.";
  } else {
    recommendations.watering = "Current humidity levels are moderate. Maintain your regular watering schedule.";
  }
  
  // Sunlight recommendations
  if (description.includes('sunny') || description.includes('clear')) {
    if (uv > 7) {
      recommendations.sunlight = "It's very sunny with high UV! Great for sun-loving plants, but protect sensitive ones from direct afternoon sun.";
    } else {
      recommendations.sunlight = "It's sunny today! Perfect conditions for your sun-loving plants.";
    }
  } else if (description.includes('cloudy') || description.includes('overcast')) {
    recommendations.sunlight = "Cloudy conditions today. Your plants might appreciate being moved closer to windows for maximum light.";
  } else if (description.includes('rain')) {
    recommendations.sunlight = "Rainy day - perfect time to focus on indoor plant care and checking for pests.";
  }
  
  // General care recommendations
  if (temp < 10) {
    recommendations.general = "Cold weather alert! Bring outdoor plants inside and reduce watering frequency.";
  } else if (temp > 35) {
    recommendations.general = "Very hot weather! Increase watering and provide shade for outdoor plants.";
  } else {
    recommendations.general = "Great weather for plant care activities!";
  }
  
  // Protection recommendations
  if (description.includes('storm') || description.includes('wind')) {
    recommendations.protection = "Stormy weather - secure outdoor plants and check for damage after the storm.";
  } else if (uv > 8) {
    recommendations.protection = "High UV levels - protect sensitive plants from direct sunlight during peak hours.";
  }
  
  return recommendations;
};

/**
 * Search for location suggestions
 * @param {string} query - Search query for location
 * @returns {Promise<Array>} Array of location suggestions
 */
exports.searchLocations = async (query) => {
  try {
    if (!WEATHER_API_KEY) {
      throw new Error('Weather API key not configured');
    }

    if (!query || query.length < 2) {
      return [];
    }

    const response = await axios.get(`${WEATHER_API_URL}/search.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: query
      }
    });

    // Format the response data
    return response.data.map(location => ({
      name: location.name,
      region: location.region,
      country: location.country,
      displayName: `${location.name}, ${location.region}, ${location.country}`,
      lat: location.lat,
      lon: location.lon
    }));
  } catch (error) {
    throw error;
  }
};
