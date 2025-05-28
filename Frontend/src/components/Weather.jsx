import React, { useState, useEffect, useRef } from 'react';
import {
  Sun, Wind, Thermometer, MapPin, Cloud, 
  Umbrella, ArrowRight, AlertCircle, Droplets, ChevronDown,
  Eye, Gauge, Search, Loader2, CloudRain, CloudSnow,
  Zap, RefreshCw
} from 'lucide-react';
import { weatherAPI } from '../services/api';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const searchTimeoutRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Remove the auto-load effect
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

  const loadWeatherData = async (searchLocation) => {
    if (!searchLocation) return;
    
    try {
      setError(null);
      setIsLoading(true);
      
      const weatherResponse = await weatherAPI.getCurrentWeather(searchLocation);
      
      if (weatherResponse.success) {
        const data = weatherResponse.data;
        
        const formattedWeather = {
          location: data.location,
          country: data.country,
          localTime: new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            hour: 'numeric', 
            minute: '2-digit' 
          }),
          condition: data.description,
          icon: data.icon.startsWith('//') ? `https:${data.icon}` : data.icon,
          temperature: Math.round(data.temperature),
          tempF: Math.round(data.temperature * 9/5 + 32),
          windSpeed: data.wind_speed,
          humidity: data.humidity,
          uv: data.uv || 6,
          pressure: data.pressure || 1013,
          visibility: data.visibility || 10
        };
        
        setWeatherData(formattedWeather);
        setLastUpdated(new Date());
        setHasSearched(true);
        
        // Load recommendations
        try {
          const recResponse = await weatherAPI.getWeatherRecommendations(searchLocation);
          if (recResponse.success) {
            setRecommendations(recResponse.data.recommendations);
          }
        } catch (recError) {
          console.warn('Could not load weather recommendations:', recError.message);
        }
      }
    } catch (error) {
      console.error('Weather service error:', error);
      setError("Unable to load weather data. Please check the location and try again.");
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const searchLocations = async (query) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        if (query.length >= 2) {
          const response = await weatherAPI.searchLocations(query);
          if (response.success) {
            setSuggestions(response.data.slice(0, 8));
            setShowSuggestions(true);
          }
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Location search error:', error);
      }
    }, 300);
  };

  const handleLocationSubmit = async (e) => {
    e?.preventDefault();
    if (!location.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);
    
    try {
      await loadWeatherData(location);
      setLocation('');
    } catch (error) {
      setError("Could not find weather data for this location.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setLocation('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    setIsSearching(true);
    
    try {
      await loadWeatherData(suggestion.name);
    } catch (error) {
      setError("Could not load weather for selected location.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
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

  const getWeatherIcon = (condition) => {
    const lowerCondition = condition?.toLowerCase() || '';
    if (lowerCondition.includes('rain')) return <CloudRain className="w-6 h-6 text-blue-500" />;
    if (lowerCondition.includes('snow')) return <CloudSnow className="w-6 h-6 text-blue-300" />;
    if (lowerCondition.includes('storm')) return <Zap className="w-6 h-6 text-yellow-500" />;
    if (lowerCondition.includes('cloud')) return <Cloud className="w-6 h-6 text-gray-500" />;
    return <Sun className="w-6 h-6 text-yellow-500" />;
  };

  const getUVLevel = (uv) => {
    if (uv <= 2) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    if (uv <= 5) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (uv <= 7) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (uv <= 10) return { level: 'Very High', color: 'text-red-600', bg: 'bg-red-100' };
    return { level: 'Extreme', color: 'text-purple-600', bg: 'bg-purple-100' };
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg mr-3">
              <Cloud size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Weather</h2>
              {lastUpdated && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Updated {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          {weatherData && (
            <button
              onClick={() => loadWeatherData(weatherData.location)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              title="Refresh weather"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative" ref={suggestionsRef}>
          <form onSubmit={handleLocationSubmit} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  searchLocations(e.target.value);
                }}
                onFocus={() => {
                  setIsSearchFocused(true);
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onBlur={() => setIsSearchFocused(false)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-600 rounded-xl outline-none transition-all bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Search for your location..."
                disabled={isSearching}
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSearching || !location.trim()}
              >
                {isSearching ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ArrowRight size={16} />
                )}
              </button>
            </div>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-50 mt-2 max-h-64 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.name}-${suggestion.region}-${index}`}
                  className={`w-full px-4 py-3 text-left border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-all ${
                    selectedSuggestionIndex === index 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                >
                  <div className="flex items-center">
                    <MapPin size={16} className="text-gray-400 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-100">{suggestion.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {suggestion.region}, {suggestion.country}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
            <AlertCircle size={16} className="text-red-500 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Weather Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Loading weather data...</p>
            </div>
          </div>
        ) : weatherData ? (
          <>
            {/* Current Weather Card */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  <MapPin size={18} className="text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {weatherData.location}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{weatherData.localTime}</p>
              </div>

              <div className="flex items-center justify-center mb-6">
                <div className="text-center">
                  <img 
                    src={weatherData.icon} 
                    alt={weatherData.condition} 
                    className="w-24 h-24 mx-auto mb-2"
                  />
                  <p className="text-xl font-medium text-gray-800 dark:text-gray-100">
                    {weatherData.condition}
                  </p>
                  <div className="mt-3">
                    <span className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                      {weatherData.temperature}°
                    </span>
                    <span className="text-lg text-gray-500 dark:text-gray-400 ml-2">
                      {weatherData.tempF}°F
                    </span>
                  </div>
                </div>
              </div>

              {/* Weather Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <WeatherDetailCard 
                  icon={<Wind className="w-5 h-5 text-blue-500" />}
                  label="Wind"
                  value={`${weatherData.windSpeed} km/h`}
                />
                <WeatherDetailCard 
                  icon={<Droplets className="w-5 h-5 text-blue-400" />}
                  label="Humidity"
                  value={`${weatherData.humidity}%`}
                />
                <WeatherDetailCard 
                  icon={<Eye className="w-5 h-5 text-gray-500" />}
                  label="Visibility"
                  value={`${weatherData.visibility} km`}
                />
                <WeatherDetailCard 
                  icon={<Gauge className="w-5 h-5 text-purple-500" />}
                  label="Pressure"
                  value={`${weatherData.pressure} mb`}
                />
              </div>

              {/* UV Index */}
              <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200/50 dark:border-yellow-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Sun className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">UV Index</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-800 dark:text-gray-100 mr-2">
                      {weatherData.uv}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUVLevel(weatherData.uv).bg} ${getUVLevel(weatherData.uv).color}`}>
                      {getUVLevel(weatherData.uv).level}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Plant Care Tips */}
            {recommendations && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg mr-3">
                    <Umbrella size={18} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Plant Care Tips
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {recommendations.watering && (
                    <TipCard 
                      icon={<Droplets className="w-4 h-4 text-blue-500" />}
                      tip={recommendations.watering}
                    />
                  )}
                  {recommendations.sunlight && (
                    <TipCard 
                      icon={<Sun className="w-4 h-4 text-yellow-500" />}
                      tip={recommendations.sunlight}
                    />
                  )}
                  {recommendations.general && (
                    <TipCard 
                      icon={getWeatherIcon(weatherData.condition)}
                      tip={recommendations.general}
                    />
                  )}
                  {recommendations.protection && (
                    <TipCard 
                      icon={<Umbrella className="w-4 h-4 text-purple-500" />}
                      tip={recommendations.protection}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cloud className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                Welcome to Weather Insights
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Get personalized plant care recommendations based on current weather conditions in your area.
              </p>
              <div className="space-y-2 text-sm text-gray-400 dark:text-gray-500">
                <p>• Real-time weather updates</p>
                <p>• Plant care suggestions</p>
                <p>• UV index monitoring</p>
              </div>
            </div>
            {!hasSearched && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 <strong>Tip:</strong> Search for your city above to get started with weather-based plant care tips!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const WeatherDetailCard = ({ icon, label, value }) => (
  <div className="bg-gray-50/80 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 dark:border-gray-600/50">
    <div className="flex items-center mb-1">
      {icon}
      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{label}</span>
    </div>
    <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{value}</p>
  </div>
);

const TipCard = ({ icon, tip }) => (
  <div className="flex items-start p-3 bg-gray-50/80 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50">
    <div className="flex-shrink-0 mt-0.5 mr-3">
      {icon}
    </div>
    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{tip}</p>
  </div>
);

export default Weather;
