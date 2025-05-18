import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, Plus, Sun, Wind, Thermometer, MapPin, Camera, LogOut,
  Settings, User, Home, Book, Bell, Droplets, Search, ChevronDown
} from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import {
  fetchWeatherByLocation,
  searchLocations,
  calculateSearchRelevance
} from '../services/weatherApi';

const Dashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [plants, setPlants] = useState([]);
  const [funFact, setFunFact] = useState('');
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [plantName, setPlantName] = useState("");
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const funFacts = [
    "Plants can recognize their siblings and help them grow!",
    "Some trees communicate through an underground fungal network.",
    "Plants can hear water and will grow towards it.",
    "The Amazon rainforest produces about 20% of the world's oxygen.",
    "Bamboo can grow up to 35 inches in a single day!"
  ];

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
    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
    setFunFact(randomFact);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);

    const newPlant = {
      id: plants.length + 1,
      name: plantName || `Plant ${plants.length + 1}`,
      image: imageSrc,
      health: "Good",
      lastWatered: new Date().toLocaleDateString()
    };

    setPlants([...plants, newPlant]);
    setShowCamera(false);
    setPlantName("");
  };

  const handleAddPlant = () => {
    setShowCamera(true);
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

  // The rest of your JSX (rendering UI, including conditional Webcam display, weather info, etc.) continues here...

  return (
    <>
      {/* Insert your JSX content here */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center space-y-4 p-4">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-80 rounded-lg shadow-lg"
          />
          <input
            type="text"
            placeholder="Enter plant name"
            value={plantName}
            onChange={(e) => setPlantName(e.target.value)}
            className="px-4 py-2 rounded-lg shadow-inner text-black"
          />
          <button
            onClick={handleCapture}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Capture & Save
          </button>
          <button
            onClick={() => setShowCamera(false)}
            className="text-red-500 hover:underline"
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
};

export default Dashboard;
