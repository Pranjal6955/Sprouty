import React, { useState, useEffect } from 'react';
import {
  Sun, Wind, Thermometer, MapPin, Cloud, 
  Umbrella, ArrowRight, AlertCircle, Droplets, ChevronDown
} from 'lucide-react';

// Mock weather data to replace API calls
const mockWeatherData = {
  location: "Bangkok",
  localTime: "Monday, 3:30 PM",
  condition: "Partly Cloudy",
  icon: "https://cdn.weatherapi.com/weather/64x64/day/116.png", // placeholder icon
  temperature: "32°C / 89°F",
  windSpeed: "15 km/h",
  humidity: "70%",
  uv: "6"
};

// Mock search locations data
const mockSearchLocations = [
  { id: 1, name: "Bangkok", region: "Bangkok", country: "Thailand", fullName: "Bangkok, Thailand", lat: 13.75, lon: 100.52 },
  { id: 2, name: "Barcelona", region: "Catalonia", country: "Spain", fullName: "Barcelona, Spain", lat: 41.39, lon: 2.16 },
  { id: 3, name: "Berlin", region: "Berlin", country: "Germany", fullName: "Berlin, Germany", lat: 52.52, lon: 13.4 }
];

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    // Use mock data instead of API call
    setWeatherData(mockWeatherData);
    setError(null);
  }, []);

  const handleLocationSearch = async (searchTerm) => {
    setLocation(searchTerm);
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    // Filter mock locations instead of API call
    const filteredLocations = mockSearchLocations.filter(
      location => location.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(filteredLocations);
  };

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation.fullName);
    setSearchResults([]);
    handleLocationSubmit(null, `${selectedLocation.lat},${selectedLocation.lon}`);
  };

  const handleLocationSubmit = async (e, locationUrl) => {
    if (e) e.preventDefault();
    if (!location && !locationUrl) return;

    setIsSearching(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      // Use mock data with slight modification to show different location
      const data = {
        ...mockWeatherData,
        location: locationUrl ? "Selected Location" : location
      };
      setWeatherData(data);
      setShowLocationInput(false);
      setError(null);
    } catch (error) {
      console.error('Weather Error:', error);
      setError("Could not load weather data");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="sticky top-0 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Cloud size={22} className="text-blue-500 mr-2" />
        Weather
      </h2>
      {/* Weather & Location Section */}
      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl shadow-sm p-5 mb-6 transition-all hover:shadow-md">
        {showLocationInput ? (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Where's your garden located?</h3>
            <form onSubmit={handleLocationSubmit} className="relative">
              <div className="flex items-center">
                <div className={`relative flex-1 ${isSearchFocused ? 'ring-2 ring-green-200' : ''} rounded-lg transition-all`}>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    className="w-full px-4 py-3 border rounded-lg outline-none transition-colors"
                    placeholder="Search for a city..."
                  />
                  <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
                <button 
                  type="submit" 
                  className={`ml-3 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors ${
                    isSearching ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <ArrowRight size={20} />
                  )}
                </button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div 
                      key={result.id}
                      onClick={() => handleLocationSelect(result)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 flex items-center"
                    >
                      <MapPin size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-gray-500">{result.region}, {result.country}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form>
            {error && <p className="text-red-500 mt-2 flex items-center"><AlertCircle size={16} className="mr-1" /> {error}</p>}
          </div>
        ) : weatherData && (
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center mb-1">
              <MapPin size={18} className="text-green-500 mr-1" />
              <h3 className="text-lg font-semibold text-gray-800">{weatherData.location}</h3>
            </div>
            <p className="text-gray-500 mb-4 text-sm">{weatherData.localTime}</p>
            
            <div className="flex flex-col items-center mb-4">
              <img src={weatherData.icon} alt={weatherData.condition} className="h-20 w-20" />
              <p className="text-xl font-medium text-gray-800 mt-1">{weatherData.condition}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 w-full mt-2">
              <WeatherItem 
                icon={<Thermometer size={20} className="text-orange-500" />} 
                label="Temperature" 
                value={weatherData.temperature} 
              />
              <WeatherItem 
                icon={<Wind size={20} className="text-blue-500" />} 
                label="Wind" 
                value={weatherData.windSpeed} 
              />
              <WeatherItem 
                icon={<Droplets size={20} className="text-blue-400" />} 
                label="Humidity" 
                value={weatherData.humidity} 
              />
              <WeatherItem 
                icon={<Sun size={20} className="text-yellow-500" />} 
                label="UV Index" 
                value={weatherData.uv} 
              />
            </div>
            
            <button 
              onClick={() => setShowLocationInput(true)}
              className="mt-4 text-green-600 text-sm font-medium flex items-center justify-center hover:text-green-700 transition-colors bg-white py-1.5 px-3 rounded-full shadow-sm"
            >
              Change location <ChevronDown size={14} className="ml-1" />
            </button>
          </div>
        )}
      </div>
      
      {/* Plant Care Tips Based on Weather */}
      {weatherData && !showLocationInput && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
            <Umbrella size={18} className="text-green-500 mr-2" /> 
            Care Tips
          </h3>
          <div className="text-gray-700 text-sm space-y-3">
            <p>• {weatherData.temperature.includes("high") ? 
              "Water your plants more frequently due to high temperatures." : 
              "Maintain regular watering schedule in these conditions."}
            </p>
            <p>• {weatherData.condition.toLowerCase().includes("rain") ? 
              "Hold off on watering today - rain is providing natural hydration." : 
              "Ensure proper drainage for your potted plants."}
            </p>
            <p>• {parseInt(weatherData.uv) > 5 ? 
              "Consider moving sensitive plants to partial shade today." : 
              "Good light conditions for most plants today."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const WeatherItem = ({ icon, label, value }) => (
  <div className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow hover:bg-gray-50 transition-all">
    <div className="mr-3">{icon}</div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800 text-sm">{value}</p>
    </div>
  </div>
);

export default Weather;
