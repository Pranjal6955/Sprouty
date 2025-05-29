import { api } from './api';

export const reminderAPI = {
  // Get all reminders
  getReminders: async () => {
    try {
      const response = await api.get('/reminders');
      return response.data;
    } catch (error) {
      console.error('Error fetching reminders:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Get upcoming reminders
  getUpcomingReminders: async () => {
    try {
      const response = await api.get('/reminders/upcoming');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming reminders:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Get due reminders
  getDueReminders: async () => {
    try {
      const response = await api.get('/reminders/due');
      return response.data;
    } catch (error) {
      console.error('Error fetching due reminders:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Create a new reminder
  createReminder: async (reminderData) => {
    try {
      const response = await api.post('/reminders', reminderData);
      return response.data;
    } catch (error) {
      console.error('Error creating reminder:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Update a reminder
  updateReminder: async (id, reminderData) => {
    try {
      const response = await api.put(`/reminders/${id}`, reminderData);
      return response.data;
    } catch (error) {
      console.error('Error updating reminder:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Delete a reminder
  deleteReminder: async (id) => {
    try {
      const response = await api.delete(`/reminders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Mark a reminder as completed
  completeReminder: async (id) => {
    try {
      const response = await api.put(`/reminders/${id}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing reminder:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Mark reminder notification as sent
  markNotificationSent: async (id) => {
    try {
      const response = await api.put(`/reminders/${id}/notification-sent`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification sent:', error);
      return { success: false, error: error.message };
    }
  }
};
