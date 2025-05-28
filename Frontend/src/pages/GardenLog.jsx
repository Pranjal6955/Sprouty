import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Droplets, AlertCircle, Scissors, Flower, Edit, Check, X, Loader, Edit2 } from 'lucide-react';
import { plantAPI } from '../services/api';
import PlantHistoryLog from '../components/PlantHistoryLog';

const PlantLogCard = ({ plant, onNotesUpdate, onStatusUpdate }) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(plant.notes || '');
  const [showHistory, setShowHistory] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(plant.status || plant.health || 'Healthy');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const statusOptions = [
    { value: 'Healthy', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    { value: 'Needs Attention', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { value: 'Critical', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  ];

  const handleNotesSubmit = async () => {
    try {
      await onNotesUpdate(plant._id || plant.id, editedNotes);
      setIsEditingNotes(false);
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const handleNotesCancel = () => {
    setEditedNotes(plant.notes || '');
    setIsEditingNotes(false);
  };

  const handleStatusUpdate = async () => {
    const currentStatus = plant.status || plant.health || 'Healthy';
    if (selectedStatus === currentStatus) {
      setIsEditingStatus(false);
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await onStatusUpdate(plant._id || plant.id, selectedStatus);
      setIsEditingStatus(false);
    } catch (error) {
      console.error('Error updating status:', error);
      // Reset to current status on error
      setSelectedStatus(currentStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const cancelStatusEdit = () => {
    setSelectedStatus(plant.status || plant.health || 'Healthy');
    setIsEditingStatus(false);
  };

  // Calculate health status based on plant data
  const getHealthStatus = (plant) => {
    const status = plant.status || plant.health || 'Healthy';
    if (status === 'Sick' || status === 'Critical') return 'Poor';
    if (status === 'Needs Attention') return 'Fair';
    return 'Good';
  };

  const getCurrentStatusStyle = () => {
    const currentStatus = plant.status || plant.health || 'Healthy';
    const status = statusOptions.find(s => s.value === currentStatus);
    return status || statusOptions[0];
  };

  // Format date strings
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Get the most recent care action of each type
  const getLastCareAction = (careHistory, actionType) => {
    if (!careHistory || !Array.isArray(careHistory)) return 'Never';
    
    const actions = careHistory.filter(action => action.actionType === actionType);
    if (actions.length === 0) return 'Never';
    
    return formatDate(actions[0].date);
  };

  const health = getHealthStatus(plant);

  const handleCardClick = (e) => {
    // Don't open history if clicking on notes section or its children
    if (!e.target.closest('.notes-section')) {
      setShowHistory(true);
    }
  };

  return (
    <>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img 
                src={plant.mainImage || plant.image || 'https://via.placeholder.com/64x64/e5e7eb/9ca3af?text=Plant'} 
                alt={plant.name} 
                className="w-16 h-16 rounded-xl object-cover ring-2 ring-green-100 dark:ring-green-900"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/64x64/e5e7eb/9ca3af?text=Plant';
                }}
              />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                health === 'Good' ? 'bg-green-500' :
                health === 'Fair' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{plant.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {plant.species || plant.nickname || 'Unknown species'}
              </p>
            </div>
          </div>
          
          {/* Status with edit functionality */}
          <div onClick={(e) => e.stopPropagation()}>
            {isEditingStatus ? (
              <div className="flex items-center space-x-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled={isUpdatingStatus}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.value}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={isUpdatingStatus}
                  className="p-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {isUpdatingStatus ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Check size={12} />
                  )}
                </button>
                <button
                  onClick={cancelStatusEdit}
                  disabled={isUpdatingStatus}
                  className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getCurrentStatusStyle().bgColor} ${getCurrentStatusStyle().color}`}>
                  {plant.status || plant.health || 'Healthy'}
                </span>
                <button
                  onClick={() => setIsEditingStatus(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Edit status"
                >
                  <Edit2 size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
            <Droplets className="text-blue-500" size={20} />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last Watered</p>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {plant.lastWatered ? formatDate(plant.lastWatered) : getLastCareAction(plant.careHistory, 'Watered')}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
            <Flower className="text-purple-500" size={20} />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last Fertilised</p>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {plant.lastFertilized ? formatDate(plant.lastFertilized) : getLastCareAction(plant.careHistory, 'Fertilized')}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
            <Scissors className="text-green-500" size={20} />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last Pruning</p>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {plant.lastPruned ? formatDate(plant.lastPruned) : getLastCareAction(plant.careHistory, 'Pruned')}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
            <AlertCircle className="text-yellow-500" size={20} />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Date Added</p>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatDate(plant.dateAdded || plant.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Add notes-section class to prevent history popup */}
        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg relative group notes-section">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Recent Notes</h4>
            {!isEditingNotes && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingNotes(true);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                <Edit size={14} className="text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>

          {isEditingNotes ? (
            <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 focus:border-green-500 dark:focus:border-green-500 focus:ring-1 focus:ring-green-500"
                rows={3}
                placeholder="Add notes about your plant..."
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleNotesCancel}
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
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {plant.notes || 'No notes added yet. Click edit to add notes about your plant.'}
            </p>
          )}
        </div>
      </div>

      <PlantHistoryLog 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        plant={plant}
      />
    </>
  );
};

const GardenLog = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState('Garden Log');
  const [searchTerm, setSearchTerm] = useState('');
  const [plantLogs, setPlantLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch plants from API
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching plants from API...');
        
        // Check if plantAPI and getAllPlants method exist
        if (!plantAPI || typeof plantAPI.getAllPlants !== 'function') {
          console.error('plantAPI or getAllPlants method not available');
          throw new Error('Plant API service is not properly configured');
        }
        
        const response = await plantAPI.getAllPlants();
        console.log('Fetched plants for Garden Log:', response);
        
        if (response && response.success) {
          setPlantLogs(response.data || []);
        } else {
          console.error('API response was not successful:', response);
          setError(response?.error || 'Failed to fetch plants');
        }
      } catch (err) {
        console.error('Error fetching plants:', err);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to load plants. Please try again.';
        
        if (err.message?.includes('Plant API service is not properly configured')) {
          errorMessage = 'Plant API service is not available. Please refresh the page.';
        } else if (err.message?.includes('Network Error') || err.code === 'NETWORK_ERROR') {
          errorMessage = 'Network connection error. Please check your internet connection.';
        } else if (err.status === 401 || err.error?.includes('unauthorized')) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (err.status === 403) {
          errorMessage = 'You do not have permission to view plants.';
        } else if (err.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  const handleNotesUpdate = async (plantId, newNotes) => {
    try {
      console.log('Updating notes for plant:', plantId, 'New notes:', newNotes);
      
      if (!plantAPI || typeof plantAPI.updatePlant !== 'function') {
        throw new Error('Plant API service is not properly configured');
      }
      
      const response = await plantAPI.updatePlant(plantId, { notes: newNotes });
      
      if (response && response.success) {
        // Update local state
        setPlantLogs(prevLogs =>
          prevLogs.map(plant =>
            plant._id === plantId || plant.id === plantId
              ? { ...plant, notes: newNotes }
              : plant
          )
        );
        console.log('Notes updated successfully');
      } else {
        throw new Error(response?.error || 'Failed to update notes');
      }
    } catch (error) {
      console.error('Error updating plant notes:', error);
      throw error;
    }
  };

  const handleStatusUpdate = async (plantId, newStatus) => {
    try {
      console.log('Updating status for plant:', plantId, 'New status:', newStatus);
      
      if (!plantAPI || typeof plantAPI.updatePlant !== 'function') {
        throw new Error('Plant API service is not properly configured');
      }
      
      const response = await plantAPI.updatePlant(plantId, { status: newStatus });
      
      if (response && response.success) {
        // Update local state
        setPlantLogs(prevLogs =>
          prevLogs.map(plant =>
            plant._id === plantId || plant.id === plantId
              ? { ...plant, status: newStatus, health: newStatus }
              : plant
          )
        );
        console.log('Status updated successfully');
      } else {
        throw new Error(response?.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating plant status:', error);
      throw error;
    }
  };

  // Filter plants based on search term
  const filteredPlants = plantLogs.filter(plant =>
    plant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.species?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
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
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader size={48} className="animate-spin text-green-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">Loading your plants...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {filteredPlants.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <Flower size={64} className="mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm ? 'No plants found' : 'No plants in your garden yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Add your first plant to start building your garden log'
                }
              </p>
              {!searchTerm && (
                <button 
                  onClick={() => setActiveNavItem('My Garden')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Your First Plant
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPlants.map(plant => (
                <PlantLogCard 
                  key={plant._id || plant.id} 
                  plant={plant} 
                  onNotesUpdate={handleNotesUpdate}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GardenLog;