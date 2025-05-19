import React, { useState, useEffect } from 'react';
import {
  Plus, Sun, Wind, Thermometer, MapPin, Camera, Cloud, 
  Umbrella, ArrowRight, AlertCircle, Droplets, ChevronDown // Add ChevronDown here
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  fetchWeatherByLocation,
  searchLocations,
  calculateSearchRelevance
} from '../services/weatherApi';
import AddPlant from '../components/AddPlant';
import LogoOJT from '../assets/LogoOJT.png';

const Dashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [plants, setPlants] = useState([]);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddPlant, setShowAddPlant] = useState(false); 
  const [plantName, setPlantName] = useState("");
  const [activeNavItem, setActiveNavItem] = useState('Home');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeWeather = async () => {
      try {
        const data = await fetchWeatherByLocation('Bangkok');
        setWeatherData(data);
        setError(null);
      } catch (error) {
        console.error('Weather API Error:', error);
        setError(error.message);
      }
    };

    initializeWeather();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleAddPlant = () => {
    setShowAddPlant(true); 
  };

  // New function to handle the plant data from AddPlant
  const handleSavePlant = (newPlant) => {
    // Add the new plant to the plants array
    setPlants([...plants, newPlant]);
    // Hide the AddPlant component
    setShowAddPlant(false);
  };

  const handleLocationSearch = async (searchTerm) => {
    setLocation(searchTerm);
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const locations = await searchLocations(searchTerm);
      const processedResults = locations
        .map(result => ({
          ...result,
          relevance: calculateSearchRelevance(searchTerm, result.name)
        }))
        .filter(result => result.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 15);

      setSearchResults(processedResults);
    } catch (error) {
      console.error('Location search error:', error);
    }
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
      const data = await fetchWeatherByLocation(locationUrl || location);
      setWeatherData(data);
      setShowLocationInput(false);
      setError(null);
    } catch (error) {
      console.error('Weather API Error:', error);
      setError(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        activeNavItem={activeNavItem}
        setActiveNavItem={setActiveNavItem}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Side Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">My Garden Dashboard</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
            
            {/* Plants Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">My Plants</h2>
                <button 
                  onClick={handleAddPlant}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm"
                >
                  <Plus size={20} className="mr-1" /> Add Plant
                </button>
              </div>

              {plants.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                  <Camera size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="font-medium">No plants yet. Add your first plant!</p>
                  <p className="text-sm mt-1">Take a photo of your plants to start tracking them</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {plants.map(plant => (
                    <div key={plant.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all group">
                      <div className="h-48 overflow-hidden bg-gray-100 relative">
                        <img 
                          src={plant.image} 
                          alt={plant.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg text-gray-800">{plant.name}</h3>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-gray-600">Health: {plant.health}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-blue-400 mr-2"></div>
                            <span className="text-gray-600">Last Watered: {plant.lastWatered}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Side - Weather Widget */}
          <div className="md:w-80 lg:w-96 bg-white border-l border-gray-100 overflow-y-auto">
            <div className="sticky top-0 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Cloud size={22} className="text-blue-500 mr-2" />
                Weather
                <img 
                src={LogoOJT} 
                alt="Sprouty Logo" 
                className="h-12 w-13 absolute right-5"
              />
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
          </div>
        </div>
      </div>

      {/* Replace Camera Modal with AddPlant Component */}
      {showAddPlant && (
        <AddPlant 
          onAddPlant={handleSavePlant} 
          onCancel={() => setShowAddPlant(false)} 
        />
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

export default Dashboard;