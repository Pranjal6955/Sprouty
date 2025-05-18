import PropTypes from 'prop-types';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '';
const BASE_URL = 'https://api.weatherapi.com/v1';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_DELAY = 1000; // 1 second

// Cache storage
const cache = new Map();
let lastRequestTime = 0;

// Helper function for rate limiting
const rateLimiter = async () => {
  const now = Date.now();
  const timeElapsed = now - lastRequestTime;
  if (timeElapsed < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeElapsed));
  }
  lastRequestTime = Date.now();
};

// Helper function for API calls with retry logic
const fetchWithRetry = async (url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await rateLimiter();
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API Error');
      }
      return response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

export const fetchWeatherByLocation = async (location) => {
  // Check cache first
  const cacheKey = `weather_${location}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const data = await fetchWithRetry(
      `${BASE_URL}/current.json?key=${API_KEY}&q=${location}&aqi=no`
    );

    const weatherData = {
      location: `${data.location.name}, ${data.location.country}`,
      temperature: `${data.current.temp_c}°C`,
      windSpeed: `${data.current.wind_kph} km/h`,
      humidity: `${data.current.humidity}%`,
      uv: data.current.uv,
      condition: data.current.condition.text,
      icon: data.current.condition.icon,
      localTime: new Date(data.location.localtime).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    // Update cache
    cache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now()
    });

    return weatherData;
  } catch (error) {
    console.error('Weather fetch error:', error);
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
};

export const searchLocations = async (searchTerm) => {
  // Check cache first
  const cacheKey = `search_${searchTerm}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const data = await fetchWithRetry(
      `${BASE_URL}/search.json?key=${API_KEY}&q=${searchTerm}`
    );
    
    const locations = data.map(result => ({
      id: result.id,
      name: result.name,
      region: result.region,
      country: result.country,
      lat: result.lat,
      lon: result.lon,
      fullName: `${result.name}, ${result.region}, ${result.country}`,
    }));

    // Update cache
    cache.set(cacheKey, {
      data: locations,
      timestamp: Date.now()
    });

    return locations;
  } catch (error) {
    console.error('Location search error:', error);
    throw new Error(`Failed to search locations: ${error.message}`);
  }
};

export const calculateSearchRelevance = (search, cityName) => {
  const searchLower = search.toLowerCase().trim();
  const cityLower = cityName.toLowerCase();
  
  if (cityLower.startsWith(searchLower)) return 100;
  
  const cityWords = cityLower.split(' ');
  for (const word of cityWords) {
    if (word.startsWith(searchLower)) return 75;
  }
  
  if (cityLower.includes(searchLower)) return 50;
  return 0;
};

// Clear cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
}, CACHE_DURATION);

// PropTypes definitions for the functions
fetchWeatherByLocation.propTypes = {
  location: PropTypes.string.isRequired
};

searchLocations.propTypes = {
  searchTerm: PropTypes.string.isRequired
};

calculateSearchRelevance.propTypes = {
  search: PropTypes.string.isRequired,
  cityName: PropTypes.string.isRequired
};
