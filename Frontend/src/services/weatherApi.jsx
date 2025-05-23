const API_KEY = "9db0b2566c374ede905175914251805";

export const fetchWeatherByLocation = async (location) => {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}&aqi=no`
    );
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return {
      location: `${data.location.name}, ${data.location.country}`,
      temperature: `${data.current.temp_c}°C`,
      condition: data.current.condition.text,
      icon: data.current.condition.icon,
      windSpeed: `${data.current.wind_kph} km/h`,
      humidity: `${data.current.humidity}%`,
      uv: data.current.uv,
      localTime: new Date(data.location.localtime).toLocaleString(),
    };
  } catch (error) {
    throw new Error('Failed to fetch weather data');
  }
};

export const searchLocations = async (query) => {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${query}`
    );
    const data = await response.json();
    
    return data.map(location => ({
      id: `${location.lat}-${location.lon}`,
      name: location.name,
      region: location.region,
      country: location.country,
      lat: location.lat,
      lon: location.lon,
      fullName: `${location.name}, ${location.country}`
    }));
  } catch (error) {
    throw new Error('Failed to search locations');
  }
};

export const calculateSearchRelevance = (query, locationName) => {
  query = query.toLowerCase();
  locationName = locationName.toLowerCase();
  
  if (locationName === query) return 1;
  if (locationName.startsWith(query)) return 0.8;
  if (locationName.includes(query)) return 0.6;
  return 0;
};
