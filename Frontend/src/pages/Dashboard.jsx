import React, { useState, useEffect } from 'react';
import {
  Plus, Camera
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import AddPlant from '../components/AddPlant';
import Weather from '../components/Weather'; // Import the new Weather component
import LogoOJT from '../assets/LogoOJT.png';
import { plantAPI } from '../services/api';

const Dashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [plants, setPlants] = useState([]);
  const [showAddPlant, setShowAddPlant] = useState(false); 
  const [activeNavItem, setActiveNavItem] = useState('Home');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch plants from database
    const fetchPlants = async () => {
      try {
        const response = await plantAPI.getPlants();
        if (response && response.data) {
          // Format plants from database to match frontend structure
          const formattedPlants = response.data.map(plant => ({
            id: plant._id,
            name: plant.name,
            species: plant.species,
            nickname: plant.nickname || plant.name,
            image: plant.mainImage,
            notes: plant.notes,
            health: plant.status,
            lastWatered: plant.lastWatered ? new Date(plant.lastWatered).toLocaleDateString() : 'Not yet watered',
            dateAdded: new Date(plant.dateAdded || plant.createdAt).toLocaleDateString()
          }));
          setPlants(formattedPlants);
        }
      } catch (error) {
        console.error('Error fetching plants:', error);
      }
    };

    fetchPlants();
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

  // Updated to handle the newly saved plant from database
  const handleSavePlant = (savedPlant) => {
    // The plant is already saved to the database in AddPlant component
    // Just add it to the local state
    setPlants(prevPlants => [...prevPlants, savedPlant]);
    // Hide the AddPlant component
    setShowAddPlant(false);
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
            <img 
                src={LogoOJT} 
                alt="Sprouty Logo" 
                className="h-17 w-16"
              />
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
            <Weather /> {/* Using the new Weather component */}
          </div>
        </div>
      </div>

      {/* AddPlant Modal */}
      {showAddPlant && (
        <AddPlant 
          onAddPlant={handleSavePlant} 
          onCancel={() => setShowAddPlant(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;