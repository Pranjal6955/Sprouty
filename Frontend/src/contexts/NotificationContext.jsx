import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Check for due reminders with better interval management
  useEffect(() => {
    let intervalId;
    
    const checkReminders = async () => {
      if (isCheckingReminders) return;
      
      setIsCheckingReminders(true);
      try {
        console.log('Checking for due reminders...');
        const response = await reminderAPI.getDueReminders();
        
        // Handle both success flag response and direct data response
        let dueReminders = [];
        if (response.success !== false) {
          dueReminders = response.data || response;
          if (!Array.isArray(dueReminders)) {
            dueReminders = [];
          }
        }
        
        // Only log if there are reminders or it's been a while since last log
        if (dueReminders.length > 0) {
          console.log('Due reminders found:', dueReminders.length);
          
          // Create notifications for due reminders
          const newNotifications = dueReminders.map(reminder => {
            console.log('Processing due reminder:', reminder);
            
            // Handle plant data - could be populated object or just ID
            let plantName = 'Unknown Plant';
            let plantImage = null;
            
            if (reminder.plant) {
              if (typeof reminder.plant === 'object') {
                plantName = reminder.plant.nickname || reminder.plant.name || 'Unknown Plant';
                plantImage = reminder.plant.mainImage;
              } else {
                // If plant is just an ID, we can't get the name without another API call
                plantName = 'Your Plant';
              }
            }
            
            return {
              id: `reminder-${reminder._id || reminder.id}`,
              type: 'reminder',
              title: `${reminder.type} Reminder`,
              message: `Time to ${reminder.type.toLowerCase()} your ${plantName}!`,
              plantName: plantName,
              plantImage: plantImage,
              reminderType: reminder.type,
              timestamp: new Date(),
              reminderId: reminder._id || reminder.id,
              reminderData: reminder // Store full reminder data
            };
          });

          setNotifications(prev => {
            // Avoid duplicate notifications
            const existingIds = prev.map(n => n.reminderId);
            const uniqueNew = newNotifications.filter(n => !existingIds.includes(n.reminderId));
            console.log('Adding new notifications:', uniqueNew.length);
            return [...prev, ...uniqueNew];
          });

          // Mark notifications as sent after a delay to allow frontend to process
          setTimeout(async () => {
            for (const reminder of dueReminders) {
              try {
                await reminderAPI.markNotificationSent(reminder._id || reminder.id);
                console.log('Marked notification as sent for reminder:', reminder._id || reminder.id);
              } catch (markError) {
                console.error('Error marking notification as sent:', markError);
              }
            }
          }, 5000); // 5 second delay
        }
      } catch (error) {
        console.error('Error checking reminders:', error);
      } finally {
        setIsCheckingReminders(false);
      }
    };

    // Check immediately on mount
    checkReminders();

    // Set up interval to check every 5 minutes instead of every minute
    intervalId = setInterval(() => {
      checkReminders();
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []); // Empty dependency array to prevent recreating the interval

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
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
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
