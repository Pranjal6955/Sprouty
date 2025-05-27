import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Droplets, AlertCircle, Scissors, Flower, Edit, Check, X } from 'lucide-react';

const PlantLogCard = ({ plant, onNotesUpdate }) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(plant.notes);

  const handleNotesSubmit = () => {
    onNotesUpdate(plant.id, editedNotes);
    setIsEditingNotes(false);
  };

  const handleCancel = () => {
    setEditedNotes(plant.notes);
    setIsEditingNotes(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img src={plant.image} alt={plant.name} className="w-16 h-16 rounded-xl object-cover ring-2 ring-green-100 dark:ring-green-900" />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
              plant.health === 'Good' ? 'bg-green-500' :
              plant.health === 'Fair' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{plant.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{plant.species}</p>
          </div>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
          plant.health === 'Good' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
          plant.health === 'Fair' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {plant.health}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
          <Droplets className="text-blue-500" size={20} />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Last Watered</p>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{plant.lastWatered}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
          <Flower className="text-purple-500" size={20} />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Last Fertilised</p>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{plant.lastFertilised}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
          <Scissors className="text-green-500" size={20} />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Last Pruning</p>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{plant.lastPruning}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
          <AlertCircle className="text-yellow-500" size={20} />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Last Diagnosis</p>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{plant.lastDiagnosis}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg relative group">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Recent Notes</h4>
          {!isEditingNotes && (
            <button
              onClick={() => setIsEditingNotes(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <Edit size={14} className="text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {isEditingNotes ? (
          <div className="space-y-3">
            <textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 focus:border-green-500 dark:focus:border-green-500 focus:ring-1 focus:ring-green-500"
              rows={3}
              placeholder="Add notes about your plant..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancel}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center text-sm"
              >
                <X size={16} className="mr-1" />
                Cancel
              </button>
              <button
                onClick={handleNotesSubmit}
                className="p-1.5 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 flex items-center text-sm"
              >
                <Check size={16} className="mr-1" />
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">{plant.notes}</p>
        )}
      </div>
    </div>
  );
};

const GardenLog = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState('Garden Log');
  const [searchTerm, setSearchTerm] = useState('');
  const [plantLogs, setPlantLogs] = useState([
    {
      id: 1,
      name: "Peace Lily",
      species: "Spathiphyllum",
      image: "https://example.com/peace-lily.jpg",
      health: "Good",
      lastWatered: "2 days ago",
      lastFertilised: "2 weeks ago",
      lastPruning: "1 month ago",
      lastDiagnosis: "No issues found",
      notes: "Plant is thriving. New leaf growth observed."
    },
    // Add more plant logs as needed
  ]);

  const handleNotesUpdate = (plantId, newNotes) => {
    setPlantLogs(prevLogs =>
      prevLogs.map(plant =>
        plant.id === plantId
          ? { ...plant, notes: newNotes }
          : plant
      )
    );
    // Here you would typically also make an API call to update the backend
    console.log(`Updating notes for plant ${plantId}:`, newNotes);
  };

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Garden Log</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search plants..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white focus:border-green-500 dark:focus:border-green-500 focus:outline-none transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plantLogs.map(plant => (
              <PlantLogCard 
                key={plant.id} 
                plant={plant} 
                onNotesUpdate={handleNotesUpdate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GardenLog;