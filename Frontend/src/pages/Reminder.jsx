import React, { useState } from 'react';
import { Bell, Calendar, Clock, Droplets, Plus, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import LogoOJT from '../assets/LogoOJT.png';

const Reminder = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('Reminders');
  const [reminders, setReminders] = useState([
    {
      id: 1,
      plantName: "Snake Plant",
      type: "Water",
      date: "2024-02-20",
      time: "09:00",
      recurring: "Weekly"
    },
    // Add more mock reminders as needed
  ]);

  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({
    plantName: "",
    type: "Water",
    date: "",
    time: "",
    recurring: "Once"
  });

  const handleAddReminder = (e) => {
    e.preventDefault();
    const reminder = {
      id: reminders.length + 1,
      ...newReminder
    };
    setReminders([...reminders, reminder]);
    setShowAddReminder(false);
    setNewReminder({
      plantName: "",
      type: "Water",
      date: "",
      time: "",
      recurring: "Once"
    });
  };

  const handleDeleteReminder = (id) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  return (
    <div className="flex h-screen bg-gray-50">
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
                className="h-17 w-16 mr-4"
              />
              <h1 className="text-2xl font-bold text-gray-800">Plant Care Reminders</h1>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6">
            {/* Add Reminder Button */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Bell className="text-green-500 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800">My Reminders</h2>
                </div>
                <button
                  onClick={() => setShowAddReminder(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm"
                >
                  <Plus size={20} className="mr-1" /> Add Reminder
                </button>
              </div>

              {/* Reminders List */}
              <div className="mt-6 space-y-4">
                {reminders.map(reminder => (
                  <div 
                    key={reminder.id}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center space-x-4">
                      <Droplets className="text-blue-500" />
                      <div>
                        <h3 className="font-medium text-gray-800">{reminder.plantName}</h3>
                        <p className="text-sm text-gray-600">
                          {reminder.type} - {reminder.recurring}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center text-gray-600">
                          <Calendar size={16} className="mr-1" />
                          <span className="text-sm">{reminder.date}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock size={16} className="mr-1" />
                          <span className="text-sm">{reminder.time}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="text-red-500 hover:text-red-600 p-2"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Add Reminder Modal */}
        {showAddReminder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Add New Reminder</h3>
              <form onSubmit={handleAddReminder}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plant Name</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={newReminder.plantName}
                      onChange={(e) => setNewReminder({...newReminder, plantName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={newReminder.type}
                      onChange={(e) => setNewReminder({...newReminder, type: e.target.value})}
                    >
                      <option>Water</option>
                      <option>Fertilize</option>
                      <option>Prune</option>
                      <option>Repot</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={newReminder.date}
                      onChange={(e) => setNewReminder({...newReminder, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <input
                      type="time"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={newReminder.time}
                      onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Recurring</label>
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={newReminder.recurring}
                      onChange={(e) => setNewReminder({...newReminder, recurring: e.target.value})}
                    >
                      <option>Once</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddReminder(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
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
