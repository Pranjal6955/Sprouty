import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, Droplets, Plus, Trash2, Loader } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import LogoOJT from '../assets/LogoOJT.png';
import { plantAPI } from '../services/api';
import { reminderAPI } from '../services/api';

const Reminder = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('Reminders');
  const [reminders, setReminders] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({
    plant: "",
    type: "Water",
    scheduledDate: "",
    time: "",
    recurring: true,
    frequency: "weekly"
  });

  // Fetch reminders and plants on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use the proper API methods
        const [reminderResponse, plantResponse] = await Promise.all([
          reminderAPI.getReminders(),
          plantAPI.getAllPlants()
        ]);
        
        if (reminderResponse.success) {
          setReminders(reminderResponse.data);
        }
        
        if (plantResponse.success) {
          setPlants(plantResponse.data);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load reminders and plants');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddReminder = async (e) => {
    e.preventDefault();
    
    if (!newReminder.plant || !newReminder.scheduledDate || !newReminder.time) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // Combine date and time
      const scheduledDateTime = new Date(`${newReminder.scheduledDate}T${newReminder.time}`);
      
      const reminderData = {
        plant: newReminder.plant,
        type: newReminder.type,
        scheduledDate: scheduledDateTime.toISOString(),
        recurring: newReminder.recurring,
        frequency: newReminder.frequency,
        notes: `${newReminder.type} reminder for plant`,
        notificationMethods: ['popup'] // Enable popup notifications
      };

      const response = await reminderAPI.createReminder(reminderData);
      
      if (response.success) {
        setReminders([...reminders, response.data]);
        setShowAddReminder(false);
        setNewReminder({
          plant: "",
          type: "Water",
          scheduledDate: "",
          time: "",
          recurring: true,
          frequency: "weekly"
        });
        setError('');
      }
    } catch (err) {
      console.error('Error creating reminder:', err);
      setError('Failed to create reminder. Please try again.');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      const response = await reminderAPI.deleteReminder(reminderId);
      
      if (response.success) {
        setReminders(reminders.filter(reminder => reminder._id !== reminderId));
      }
    } catch (err) {
      console.error('Error deleting reminder:', err);
      setError('Failed to delete reminder');
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const getPlantName = (plantId) => {
    const plant = plants.find(p => p._id === plantId);
    return plant ? plant.name : 'Unknown Plant';
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar 
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          activeNavItem={activeNavItem}
          setActiveNavItem={setActiveNavItem}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader size={48} className="animate-spin text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading reminders...</p>
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

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <img 
                src={LogoOJT} 
                alt="Sprouty Logo" 
                className="h-17 w-16"
              />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white ml-2">Plant Care Reminders</h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowAddReminder(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm"
              >
                <Plus size={20} className="mr-1" /> Add Reminder
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Main Content */}
          <div className="grid gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Bell className="text-green-500 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">My Reminders</h2>
                </div>
              </div>

              {/* Reminders List */}
              <div className="mt-6 space-y-4">
                {reminders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No reminders set yet. Add your first reminder!</p>
                  </div>
                ) : (
                  reminders.map(reminder => (
                    <div 
                      key={reminder._id}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-center space-x-4">
                        <Droplets className="text-blue-500" />
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-white">
                            {getPlantName(reminder.plant)}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {reminder.type} - {reminder.recurring ? `${reminder.frequency}` : 'Once'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Calendar size={16} className="mr-1" />
                            <span className="text-sm">{formatDate(reminder.scheduledDate)}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Clock size={16} className="mr-1" />
                            <span className="text-sm">{formatTime(reminder.scheduledDate)}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteReminder(reminder._id)}
                          className="text-red-500 hover:text-red-600 p-2"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Reminder Modal */}
        {showAddReminder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Add New Reminder</h3>
              <form onSubmit={handleAddReminder}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plant</label>
                    <select
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={newReminder.plant}
                      onChange={(e) => setNewReminder({...newReminder, plant: e.target.value})}
                    >
                      <option value="">Select a plant...</option>
                      {plants.map(plant => (
                        <option key={plant._id} value={plant._id}>
                          {plant.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={newReminder.type}
                      onChange={(e) => setNewReminder({...newReminder, type: e.target.value})}
                    >
                      <option value="Water">Water</option>
                      <option value="Fertilize">Fertilize</option>
                      <option value="Prune">Prune</option>
                      <option value="Repot">Repot</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                    <input
                      type="date"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={newReminder.scheduledDate}
                      onChange={(e) => setNewReminder({...newReminder, scheduledDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                    <input
                      type="time"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={newReminder.time}
                      onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</label>
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={newReminder.frequency}
                      onChange={(e) => setNewReminder({...newReminder, frequency: e.target.value})}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddReminder(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Add Reminder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reminder;
