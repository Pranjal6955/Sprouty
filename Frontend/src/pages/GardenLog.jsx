import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Filter, Droplets, Thermometer, Heart, AlertCircle } from 'lucide-react';

const PlantLogCard = ({ plant }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <img src={plant.image} alt={plant.name} className="w-12 h-12 rounded-full object-cover" />
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{plant.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{plant.species}</p>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-sm ${
        plant.health === 'Good' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
        plant.health === 'Fair' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      }`}>
        {plant.health}
      </span>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="flex items-center space-x-2">
        <Droplets className="text-blue-500" size={18} />
        <span className="text-sm text-gray-600 dark:text-gray-300">Last Watered: {plant.lastWatered}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Thermometer className="text-red-500" size={18} />
        <span className="text-sm text-gray-600 dark:text-gray-300">Temperature: {plant.temperature}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Heart className="text-green-500" size={18} />
        <span className="text-sm text-gray-600 dark:text-gray-300">Humidity: {plant.humidity}</span>
      </div>
      <div className="flex items-center space-x-2">
        <AlertCircle className="text-yellow-500" size={18} />
        <span className="text-sm text-gray-600 dark:text-gray-300">Last Diagnosis: {plant.lastDiagnosis}</span>
      </div>
    </div>

    <div className="text-sm text-gray-600 dark:text-gray-300">
      <h4 className="font-medium mb-2">Recent Notes:</h4>
      <p className="text-gray-500 dark:text-gray-400">{plant.notes}</p>
    </div>
  </div>
);

const GardenLog = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState('Garden Log');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual data from your backend
  const plantLogs = [
    {
      id: 1,
      name: "Peace Lily",
      species: "Spathiphyllum",
      image: "https://example.com/peace-lily.jpg",
      health: "Good",
      lastWatered: "2 days ago",
      temperature: "22°C",
      humidity: "65%",
      lastDiagnosis: "No issues found",
      notes: "Plant is thriving. New leaf growth observed."
    },
    // Add more plant logs as needed
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        activeNavItem={activeNavItem}
        setActiveNavItem={setActiveNavItem}
      />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Garden Log</h1>
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search plants..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
              <button className="px-4 py-2 flex items-center space-x-2 bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <Filter size={20} />
                <span>Filter</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {plantLogs.map(plant => (
              <PlantLogCard key={plant.id} plant={plant} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GardenLog;