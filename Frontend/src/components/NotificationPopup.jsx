import React, { useState, useEffect } from 'react';
import { X, Bell, Droplets, Leaf, Scissors, Package, CheckCircle, Clock } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { reminderAPI } from '../services/api';

const NotificationPopup = () => {
  const { notifications, clearNotification } = useNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    // Show notifications one by one with a delay
    notifications.forEach((notification, index) => {
      setTimeout(() => {
        setVisibleNotifications(prev => {
          if (!prev.find(n => n.id === notification.id)) {
            return [...prev, { ...notification, visible: true }];
          }
          return prev;
        });
      }, index * 500);
    });

    // Auto-remove notifications after 10 seconds
    notifications.forEach(notification => {
      setTimeout(() => {
        handleDismiss(notification.id);
      }, 10000);
    });
  }, [notifications]);

  const handleDismiss = (id) => {
    setVisibleNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, visible: false } : n)
    );
    
    setTimeout(() => {
      setVisibleNotifications(prev => prev.filter(n => n.id !== id));
      clearNotification(id);
    }, 300);
  };

  const handleComplete = async (notification) => {
    try {
      if (notification.reminderId) {
        await reminderAPI.completeReminder(notification.reminderId);
      }
      handleDismiss(notification.id);
    } catch (error) {
      console.error('Error completing reminder:', error);
    }
  };

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'water': return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'fertilize': return <Leaf className="w-5 h-5 text-green-500" />;
      case 'prune': return <Scissors className="w-5 h-5 text-orange-500" />;
      case 'repot': return <Package className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm transform transition-all duration-300 ${
            notification.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
        >
          <div className="flex items-start space-x-3">
            {/* Plant Image or Icon */}
            <div className="flex-shrink-0">
              {notification.plantImage ? (
                <img
                  src={notification.plantImage}
                  alt={notification.plantName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  {getIcon(notification.reminderType)}
                </div>
              )}
            </div>

            {/* Notification Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {notification.title}
                </h4>
                <button
                  onClick={() => handleDismiss(notification.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {notification.message}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 mt-3">
                <button
                  onClick={() => handleComplete(notification)}
                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-full transition-colors"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Mark Done
                </button>
                
                <button
                  onClick={() => handleDismiss(notification.id)}
                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 rounded-full transition-colors"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Later
                </button>
              </div>

              {/* Timestamp */}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationPopup;
