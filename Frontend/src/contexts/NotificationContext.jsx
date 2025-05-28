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

  // Check for due reminders every minute
  useEffect(() => {
    const checkReminders = async () => {
      if (isCheckingReminders) return;
      
      setIsCheckingReminders(true);
      try {
        const response = await reminderAPI.getDueReminders();
        if (response.success && response.data.length > 0) {
          // Create notifications for due reminders
          const newNotifications = response.data.map(reminder => ({
            id: reminder._id,
            type: 'reminder',
            title: `${reminder.type} Reminder`,
            message: `Time to ${reminder.type.toLowerCase()} your ${reminder.plant?.name || reminder.plant?.nickname || 'plant'}!`,
            plantName: reminder.plant?.name || reminder.plant?.nickname,
            plantImage: reminder.plant?.mainImage,
            reminderType: reminder.type,
            timestamp: new Date(),
            reminderId: reminder._id
          }));

          setNotifications(prev => {
            // Avoid duplicate notifications
            const existingIds = prev.map(n => n.reminderId);
            const uniqueNew = newNotifications.filter(n => !existingIds.includes(n.reminderId));
            return [...prev, ...uniqueNew];
          });

          // Mark notifications as sent
          for (const reminder of response.data) {
            await reminderAPI.markNotificationSent(reminder._id);
          }
        }
      } catch (error) {
        console.error('Error checking reminders:', error);
      } finally {
        setIsCheckingReminders(false);
      }
    };

    // Check immediately
    checkReminders();

    // Set up interval to check every minute
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [isCheckingReminders]);

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
