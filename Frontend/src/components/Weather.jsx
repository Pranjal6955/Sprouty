import React, { useState, useEffect, useRef } from 'react';
import {
  Sun, Wind, Thermometer, MapPin, Cloud, 
  Umbrella, ArrowRight, AlertCircle, Droplets, ChevronDown
} from 'lucide-react';
import { weatherAPI } from '../services/api';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchTimeoutRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    // Load weather data for default location on component mount
    loadWeatherData();
  }, []);

  // Handle location input changes with debounced search
  useEffect(() => {
    if (location.length >= 2) {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set new timeout for search
      searchTimeoutRef.current = setTimeout(() => {
        searchLocations(location);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [location]);

  const searchLocations = async (query) => {
    try {
      const response = await weatherAPI.searchLocations(query);
      if (response.success) {
        setSuggestions(response.data);
        setShowSuggestions(response.data.length > 0);
        setSelectedSuggestionIndex(-1);
      }
    } catch (error) {
      console.error('Location search error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const loadWeatherData = async (searchLocation = null) => {
    try {
      setError(null);
      setIsUsingMockData(false);
      
      const weatherResponse = await weatherAPI.getCurrentWeather(searchLocation);
      
      if (weatherResponse.success) {
        const data = weatherResponse.data;
        
        // Check if using mock data
        if (weatherResponse.note) {
          setIsUsingMockData(true);
          console.warn('Weather API Note:', weatherResponse.note);
        }
        
        // Format weather data for display
        const formattedWeather = {
          location: data.location,
          country: data.country,
          localTime: new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            hour: 'numeric', 
            minute: '2-digit' 
          }),
          condition: data.description,
          icon: data.icon.startsWith('//') ? `https:${data.icon}` : data.icon, // Handle WeatherAPI icon format
          temperature: `${Math.round(data.temperature)}°C / ${Math.round(data.temperature * 9/5 + 32)}°F`,
          windSpeed: `${data.wind_speed} km/h`,
          humidity: `${data.humidity}%`,
          uv: data.uv || "6",
          pressure: data.pressure ? `${data.pressure} mb` : "N/A",
          visibility: data.visibility ? `${data.visibility} km` : "N/A"
        };
        
        setWeatherData(formattedWeather);
        
        // Load recommendations
        try {
          const recResponse = await weatherAPI.getWeatherRecommendations(searchLocation);
          if (recResponse.success) {
            setRecommendations(recResponse.data.recommendations);
          }
        } catch (recError) {
          console.warn('Could not load weather recommendations:', recError.message);
          // Don't show error for recommendations failure
        }
        
        setShowLocationInput(false);
      }
    } catch (error) {
      console.error('Weather Error:', error);
      setError("Could not load weather data. Please check your internet connection and try again.");
      setIsUsingMockData(false);
    }
  };

  const handleLocationSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!location) return;

    setIsSearching(true);
    setShowSuggestions(false);
    try {
      await loadWeatherData(location);
    } catch (error) {
      setError("Could not find weather data for this location.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setLocation(suggestion.displayName);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    // Auto-submit when suggestion is selected
    setTimeout(() => {
      loadWeatherData(suggestion.displayName);
      setIsSearching(true);
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        } else {
          handleLocationSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="sticky top-0 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Cloud size={22} className="text-sprouty-green-500 mr-2" />
        Weather
        {isUsingMockData && (
          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            Demo
          </span>
        )}
      </h2>
      
      <div className="bg-gradient-to-br from-sprouty-green-50 to-blue-50 rounded-xl shadow-sm p-5 mb-6 transition-all hover:shadow-md">
        {showLocationInput ? (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Where's your garden located?</h3>
            <form onSubmit={handleLocationSubmit} className="relative" ref={suggestionsRef}>
              <div className="flex items-center">
                <div className={`relative flex-1 ${isSearchFocused ? 'ring-2 ring-sprouty-green-200' : ''} rounded-lg transition-all`}>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onFocus={() => {
                      setIsSearchFocused(true);
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    onBlur={() => setIsSearchFocused(false)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-4 py-3 border rounded-lg outline-none transition-colors"
                    placeholder="Enter city name..."
                    required
                    autoComplete="off"
                  />
                  <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={`${suggestion.name}-${suggestion.region}-${index}`}
                          className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            selectedSuggestionIndex === index 
                              ? 'bg-sprouty-green-50 text-sprouty-green-700' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleSuggestionClick(suggestion)}
                          onMouseEnter={() => setSelectedSuggestionIndex(index)}
                        >
                          <div className="flex items-center">
                            <MapPin size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-gray-800">{suggestion.name}</div>
                              <div className="text-sm text-gray-500">
                                {suggestion.region}, {suggestion.country}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  type="submit" 
                  className={`ml-3 bg-sprouty-green-500 text-white p-3 rounded-lg hover:bg-sprouty-green-600 transition-colors ${
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
            </form>
            {error && (
              <div className="mt-2 text-red-500 text-sm flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {error}
                {isUsingMockData && (
                  <span className="ml-2 text-yellow-600">(Showing demo data)</span>
                )}
              </div>
            )}
          </div>
        ) : weatherData && (
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center mb-1">
              <MapPin size={18} className="text-sprouty-green-500 mr-1" />
              <h3 className="text-lg font-semibold text-gray-800">{weatherData.location}</h3>
              {isUsingMockData && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Demo
                </span>
              )}
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
              className="mt-4 text-sprouty-green-600 text-sm font-medium flex items-center justify-center hover:text-sprouty-green-700 transition-colors bg-white py-1.5 px-3 rounded-full shadow-sm"
            >
              Change location <ChevronDown size={14} className="ml-1" />
            </button>
          </div>
        )}
      </div>
      
      {/* Plant Care Tips Based on Weather */}
      {weatherData && !showLocationInput && recommendations && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
            <Umbrella size={18} className="text-sprouty-green-500 mr-2" /> 
            Care Tips
            {isUsingMockData && (
              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Demo
              </span>
            )}
          </h3>
          <div className="text-gray-700 text-sm space-y-3">
            {recommendations.watering && <p>• {recommendations.watering}</p>}
            {recommendations.sunlight && <p>• {recommendations.sunlight}</p>}
            {recommendations.general && <p>• {recommendations.general}</p>}
            {recommendations.protection && <p>• {recommendations.protection}</p>}
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
