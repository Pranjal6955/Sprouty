import React, { useState, useEffect } from 'react';
import { Menu, Plus, Sun, Wind, Thermometer, MapPin, Camera, LogOut, Settings, User, Home, Book, Bell } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [plants, setPlants] = useState([]);
  const [funFact, setFunFact] = useState('');
  const navigate = useNavigate();

  const funFacts = [
    "Plants can recognize their siblings and help them grow!",
    "Some trees communicate through an underground fungal network.",
    "Plants can hear water and will grow towards it.",
    "The Amazon rainforest produces about 20% of the world's oxygen.",
    "Bamboo can grow up to 35 inches in a single day!"
  ];

  useEffect(() => {
    // Set random fun fact
    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
    setFunFact(randomFact);

    // Mock weather data - replace with actual API call
    setWeatherData({
      location: "Bangkok, Thailand",
      temperature: "32°C",
      windSpeed: "12 km/h",
      sunlight: "High"
    });
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
    // Mock adding a plant - replace with actual camera/upload functionality
    const newPlant = {
      id: plants.length + 1,
      name: "New Plant",
      image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=300",
      health: "Good",
      lastWatered: "Today"
    };
    setPlants([...plants, newPlant]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Sidebar Menu */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white/90 backdrop-blur-sm border-r border-green-100 shadow-lg transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-50`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="text-2xl font-bold text-emerald-600">Sprouty</span>
            <button onClick={() => setIsMenuOpen(false)} className="text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="space-y-4">
            <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 p-3 rounded-lg transition duration-200">
              <Home size={20} />
              <span>Home</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 p-3 rounded-lg transition duration-200">
              <User size={20} />
              <span>Profile</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 p-3 rounded-lg transition duration-200">
              <Book size={20} />
              <span>Plant Guide</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 p-3 rounded-lg transition duration-200">
              <Bell size={20} />
              <span>Notifications</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 p-3 rounded-lg transition duration-200">
              <Settings size={20} />
              <span>Settings</span>
            </a>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-3 text-red-600 hover:bg-red-50 w-full p-3 rounded-lg transition duration-200"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 lg:ml-0">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="text-gray-700 hover:text-emerald-600 transition duration-200"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-4">
            <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md border border-green-100">
              <User size={24} className="text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, Plant Parent! 🌱</h1>
          <p className="text-gray-600 mt-2">Let's check on your green friends today.</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Plant List */}
          <div className="lg:col-span-3 space-y-6">
            {/* Add Plant Button */}
            <button
              onClick={handleAddPlant}
              className="w-full bg-white/90 backdrop-blur-sm border border-green-100 rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 flex items-center justify-center space-x-3 text-emerald-600 hover:text-emerald-700"
            >
              <Camera size={24} />
              <span className="text-lg font-medium">Add New Plant</span>
            </button>

            {/* Plant Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plants.map((plant) => (
                <div key={plant.id} className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-lg transition duration-300 border border-green-100">
                  <img src={plant.image} alt={plant.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800">{plant.name}</h3>
                  <p className="text-gray-600">Health: {plant.health}</p>
                  <p className="text-gray-600">Last Watered: {plant.lastWatered}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Weather and Fun Facts */}
          <div className="space-y-6">
            {/* Weather Widget */}
            {weatherData && (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-green-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Conditions</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <MapPin size={20} className="mr-2" />
                    <span>{weatherData.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Thermometer size={20} className="mr-2" />
                    <span>{weatherData.temperature}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Wind size={20} className="mr-2" />
                    <span>{weatherData.windSpeed}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Sun size={20} className="mr-2" />
                    <span>{weatherData.sunlight}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Fun Fact Widget */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-green-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Did you know?</h3>
              <p className="text-gray-600">{funFact}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;