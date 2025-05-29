import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { reminderAPI } from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isCheckingReminders, setIsCheckingReminders] = useState(false);
  const [reminderNotifications, setReminderNotifications] = useState({});
  const notificationRef = useRef(null);

  // Establish global reference for the notification manager
  // This allows direct access from API service and other non-React components
  useEffect(() => {
    // Create notification manager interface
    const notificationManager = {
      addNotification: (notification) => {
        addNotification(notification);
      },
      processDueReminders: (reminders) => {
        processReminderNotifications(reminders);
      },
      removeReminderNotification: (reminderId) => {
        if (reminderId) {
          removeNotification(`reminder-${reminderId}`);
        }
      },
      clearAllNotifications: clearAllNotifications
    };

    // Store reference in window for global access
    window.notificationManager = notificationManager;
    notificationRef.current = notificationManager;

    // Cleanup function
    return () => {
      delete window.notificationManager;
    };
  }, []);

  // Enhanced function to process reminder notifications
  const processReminderNotifications = (reminders) => {
    if (!Array.isArray(reminders) || reminders.length === 0) return;
    
    console.log('Processing due reminders for notifications:', reminders.length);
    
    // Create notifications for due reminders
    const newNotifications = reminders.map(reminder => {
      // Extract plant information
      let plantName = 'Unknown Plant';
      let plantImage = null;
      
      if (reminder.plant) {
        if (typeof reminder.plant === 'object') {
          plantName = reminder.plant.nickname || reminder.plant.name || 'Unknown Plant';
          plantImage = reminder.plant.mainImage;
        } else {
          plantName = 'Your Plant';
        }
      }
      
      // Create the notification object
      return {
        id: `reminder-${reminder._id}`,
        type: 'reminder',
        title: `${reminder.type} Reminder`,
        message: `Time to ${reminder.type.toLowerCase()} your ${plantName}!`,
        plantName: plantName,
        plantImage: plantImage,
        reminderType: reminder.type,
        timestamp: new Date(),
        reminderId: reminder._id,
        reminderData: reminder, // Store full reminder data
        priority: 'high', // Mark reminders as high priority
        autoClose: false // Don't auto close reminder notifications
      };
    });

    // Update the state with new notifications, avoiding duplicates
    setNotifications(prev => {
      const existingIds = prev.map(n => n.id);
      const uniqueNew = newNotifications.filter(n => !existingIds.includes(n.id));
      
      if (uniqueNew.length > 0) {
        console.log('Adding new notifications:', uniqueNew.length);
        
        // Mark notifications as sent to avoid duplicates
        setTimeout(async () => {
          uniqueNew.forEach(async (notification) => {
            if (notification.reminderId) {
              try {
                await reminderAPI.markNotificationSent(notification.reminderId);
                console.log('Marked notification as sent for reminder:', notification.reminderId);
              } catch (error) {
                console.error('Error marking notification as sent:', error);
              }
            }
          });
        }, 1000);
        
        return [...prev, ...uniqueNew];
      }
      
      return prev;
    });
  };

  // Check for due reminders with better interval management
  useEffect(() => {
    let intervalId;
    
    const checkReminders = async () => {
      if (isCheckingReminders) return;
      
      setIsCheckingReminders(true);
      try {
        console.log('Checking for due reminders...');
        const response = await reminderAPI.getDueReminders();
        
        // Handle response
        if (response.success !== false && response.data) {
          processReminderNotifications(response.data);
        }
      } catch (error) {
        console.error('Error checking reminders:', error);
      } finally {
        setIsCheckingReminders(false);
      }
    };

    // Check immediately on mount
    checkReminders();

    // Set up interval to check every 3 minutes instead of 5 for more responsive notifications
    intervalId = setInterval(() => {
      checkReminders();
    }, 3 * 60 * 1000); 

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isCheckingReminders]); // Add dependency to prevent concurrent checks

  const addNotification = (notification) => {
    const newNotification = {
      id: notification.id || `notification-${Date.now()}`,
      timestamp: new Date(),
      ...notification
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotification = (id) => {
    removeNotification(id);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotification,
    clearAllNotifications,
    processDueReminders: processReminderNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
