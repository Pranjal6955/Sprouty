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
    console.error('WeatherAPI Error:', error.message);
    if (error.response) {
      console.error('WeatherAPI Response:', error.response.data);
    }
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
    console.error('WeatherAPI Forecast Error:', error.message);
    if (error.response) {
      console.error('WeatherAPI Forecast Response:', error.response.data);
    }
    throw error;
  }
};

/**
 * Generate plant care recommendations based on weather conditions
 * @param {object} weatherData - Current weather data
 * @returns {object} Care recommendations
 */
exports.generateRecommendations = (weatherData) => {
  const temp = weatherData.temperature;
  const humidity = weatherData.humidity;
  const windSpeed = weatherData.wind_speed;
  const description = weatherData.description.toLowerCase();
  const uv = weatherData.uv;
  
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
  } else if (description.includes('partly cloudy') || description.includes('mostly cloudy')) {
    recommendations.sunlight = "It's partly cloudy. Good diffused light for most plants. Sun-loving plants might need supplemental light.";
  } else if (description.includes('overcast') || description.includes('cloudy')) {
    recommendations.sunlight = "It's cloudy today. Your shade plants will be comfortable, but sun-loving plants might need grow lights.";
  } else if (description.includes('rain') || description.includes('drizzle')) {
    recommendations.sunlight = "It's rainy today. Keep plants away from windows if they don't like wet leaves.";
  }
  
  // General care recommendations
  if (temp > 35) {
    recommendations.general = "It's very hot! Move plants away from hot windows, increase humidity, and ensure adequate watering.";
  } else if (temp < 0) {
    recommendations.general = "It's freezing! Bring outdoor plants inside and keep indoor plants away from cold windows.";
  } else if (temp < 10) {
    recommendations.general = "It's cold! Keep plants away from drafty windows and consider reducing watering frequency.";
  } else if (windSpeed > 15) {
    recommendations.general = "It's very windy today! Secure or move outdoor plants to prevent damage.";
  } else {
    recommendations.general = "Weather conditions are favorable for most plants today.";
  }
  
  // Protection recommendations
  if (description.includes('storm') || description.includes('thunder')) {
    recommendations.protection = "Stormy weather ahead! Bring in outdoor plants and ensure indoor plants are secure.";
  } else if (description.includes('hail')) {
    recommendations.protection = "Hail warning! Protect all outdoor plants immediately.";
  } else if (windSpeed > 25) {
    recommendations.protection = "Strong winds expected! Secure or relocate vulnerable plants.";
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
    console.error('WeatherAPI Search Error:', error.message);
    
    // Return mock suggestions as fallback
    const mockSuggestions = [
      { name: query, region: 'Unknown', country: 'Unknown', displayName: `${query}, Unknown, Unknown`, lat: 0, lon: 0 }
    ];
    
    return mockSuggestions;
  }
};
