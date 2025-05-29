import React, { useState, useEffect, useCallback } from 'react';
import { X, Bell, Droplets, Leaf, Scissors, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { reminderAPI } from '../services/api';

const NotificationPopup = () => {
  const { notifications, clearNotification } = useNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  const [audioEnabled] = useState(true);

  // Use sound effect for notifications (optional)
  const playNotificationSound = useCallback(() => {
    if (audioEnabled) {
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play prevented by browser policy'));
      } catch (error) {
        console.log('Audio notification not supported');
      }
    }
  }, [audioEnabled]);

  useEffect(() => {
    // Show notifications one by one with a delay and play sound
    if (notifications.length > 0 && notifications.some(n => !visibleNotifications.find(vn => vn.id === n.id))) {
      // Play sound only if there are new notifications
      playNotificationSound();
    }

    // Process notifications to display
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

    // Auto-remove regular notifications after 8 seconds, but keep reminders
    notifications.forEach(notification => {
      // Don't auto-dismiss reminder notifications or ones marked as autoClose: false
      if (notification.type !== 'reminder' && notification.autoClose !== false) {
        setTimeout(() => {
          handleDismiss(notification.id);
        }, 8000);
      }
    });
  }, [notifications, playNotificationSound]);

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
        const response = await reminderAPI.completeReminder(notification.reminderId);
        if (response.success !== false) {
          // Add a success notification
          if (window.notificationManager) {
            window.notificationManager.addNotification({
              title: 'Reminder Completed',
              message: `${notification.reminderType} task completed for ${notification.plantName}`,
              type: 'success',
              autoClose: true
            });
          }
        }
      }
      handleDismiss(notification.id);
    } catch (error) {
      console.error('Error completing reminder:', error);
      // Show error notification
      if (window.notificationManager) {
        window.notificationManager.addNotification({
          title: 'Error',
          message: 'Failed to complete reminder. Please try again.',
          type: 'error',
          autoClose: true
        });
      }
    }
  };

  const getIcon = (type, notificationType) => {
    if (notificationType === 'error') return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (notificationType === 'success') return <CheckCircle className="w-5 h-5 text-green-500" />;
    
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
    <div className="fixed top-4 right-4 z-50 space-y-3 max-h-screen overflow-y-auto pb-20">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm transform transition-all duration-300 ${
            notification.priority === 'high' ? 'border-l-4 border-l-red-500' : ''
          } ${
            notification.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
        >
          <div className="flex items-start space-x-3">
            {/* Plant Image or Icon */}
            <div className="flex-shrink-0">
              {notification.plantImage ? (
                <img
                  src={notification.plantImage}
                  alt={notification.plantName || 'Notification'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
                />
              ) : (
                <div className={`w-12 h-12 rounded-full ${
                  notification.type === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                  notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                  'bg-green-100 dark:bg-green-900/30'
                } flex items-center justify-center`}>
                  {getIcon(notification.reminderType, notification.type)}
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

              {/* Action Buttons - Only show for reminders */}
              {notification.type === 'reminder' && (
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
              )}

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
