import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL || 'https://api.cloudinary.com/v1_1/';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include the auth token in requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Upload image to Cloudinary and return the URL
const uploadToCloudinary = async (imageData) => {
  try {
    console.log("Starting Cloudinary upload process");
    
    // If it's already a URL, just return it
    if (typeof imageData === 'string' && !imageData.startsWith('data:image')) {
      console.log("Using existing image URL");
      return imageData;
    }

    // Extract base64 data (remove the prefix)
    let base64Data = imageData;
    if (imageData.startsWith('data:image')) {
      base64Data = imageData.split(',')[1];
    }

    // Prepare the form data
    const formData = new FormData();
    formData.append('file', `data:image/jpeg;base64,${base64Data}`);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    console.log("Uploading to Cloudinary with preset:", CLOUDINARY_UPLOAD_PRESET);
    console.log("Cloudinary cloud name:", CLOUDINARY_CLOUD_NAME);

    // Upload to Cloudinary
    const uploadUrl = `${CLOUDINARY_URL}${CLOUDINARY_CLOUD_NAME}/image/upload`;
    console.log("Uploading to URL:", uploadUrl);
    
    const response = await axios.post(uploadUrl, formData);

    if (response.data && response.data.secure_url) {
      console.log('✅ Image uploaded to Cloudinary:', response.data.secure_url);
      return response.data.secure_url;
    } else {
      console.error("Cloudinary response missing secure_url:", response.data);
      throw new Error('Failed to get image URL from Cloudinary');
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    if (error.response) {
      console.error('Cloudinary error response:', error.response.data);
    }
    throw error;
  }
};

// Fix the token inconsistency - use 'authToken' consistently
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken'); // Changed from 'token' to 'authToken'
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Auth Services
export const authAPI = {
  register: async (userData) => {
    // Include Firebase UID if available to link accounts
    if (userData.firebaseUid) {
      console.log(`Including Firebase UID in registration: ${userData.firebaseUid}`);
    }
    
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    // Support both standard and OAuth logins
    if (credentials.oAuthProvider) {
      console.log(`Login with ${credentials.oAuthProvider} OAuth`);
    }
    
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },
  
  verifyToken: async () => {
    const response = await axiosInstance.get('/auth/verify-token');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/auth/forgotpassword', { email });
    return response.data;
  },
  
  resetPassword: async (resetToken, password) => {
    const response = await axiosInstance.put(`/auth/resetpassword/${resetToken}`, { password });
    return response.data;
  },

  // New method to link Firebase and backend accounts if needed
  linkAccounts: async (firebaseUid) => {
    const response = await axiosInstance.post('/auth/link-accounts', { firebaseUid });
    return response.data;
  }
};

// User Services
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Updating profile with data:', { 
        ...profileData, 
        avatar: profileData.avatar ? 'Image data present' : 'No avatar' 
      });

      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update localStorage user data
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { 
        ...storedUser, 
        name: profileData.name || storedUser.name,
        avatar: profileData.avatar || storedUser.avatar 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      console.log('Profile updated successfully');
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Get user stats
  getStats: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/users/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      return data;
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  }
};

// Plant Services
export const plantAPI = {
  // Create a new plant
  createPlant: async (plantData) => {
    try {
      const response = await axiosInstance.post('/plants', plantData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all plants for the current user
  getAllPlants: async () => {
    try {
      const response = await axiosInstance.get('/plants');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all plants (alias for getAllPlants for compatibility)
  getPlants: async () => {
    try {
      const response = await axiosInstance.get('/plants');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get a specific plant by ID
  getPlant: async (plantId) => {
    try {
      const response = await axiosInstance.get(`/plants/${plantId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update a plant
  updatePlant: async (plantId, updateData) => {
    try {
      const response = await axiosInstance.put(`/plants/${plantId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete a plant
  deletePlant: async (plantId) => {
    try {
      const response = await axiosInstance.delete(`/plants/${plantId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update plant care history
  updateCareHistory: async (plantId, careData) => {
    try {
      const response = await axiosInstance.put(`/plants/${plantId}/care`, careData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add growth milestone
  addGrowthMilestone: async (plantId, milestoneData) => {
    try {
      const response = await axiosInstance.post(`/plants/${plantId}/growth`, milestoneData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Identify plant from image
  identifyPlant: async (imageData) => {
    try {
      let requestData;
      
      // Check if imageData is a base64 string or URL
      if (typeof imageData === 'string') {
        if (imageData.startsWith('data:image/')) {
          // It's a base64 image
          const base64Data = imageData.split(',')[1]; // Remove data:image/jpeg;base64, prefix
          requestData = { base64Image: base64Data };
        } else if (imageData.startsWith('http') || imageData.startsWith('https')) {
          // It's a URL
          requestData = { imageUrl: imageData };
        } else {
          // Assume it's base64 without prefix
          requestData = { base64Image: imageData };
        }
      } else {
        // If it's an object, pass it as is
        requestData = imageData;
      }

      const response = await axiosInstance.post('/plants/identify', requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Search plant by name
  searchPlantByName: async (plantName) => {
    try {
      const response = await axiosInstance.get(`/plants/search?name=${encodeURIComponent(plantName)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Plant care actions
  waterPlant: async (plantId, data = {}) => {
    try {
      const response = await axiosInstance.post(`/plants/${plantId}/water`, {
        notes: data.notes,
        amount: data.amount
      });
      return response.data;
    } catch (error) {
      console.error('Error watering plant:', error);
      throw error;
    }
  },

  fertilizePlant: async (plantId, data = {}) => {
    try {
      const response = await axiosInstance.post(`/plants/${plantId}/fertilize`, {
        notes: data.notes,
        fertilizerType: data.fertilizerType
      });
      return response.data;
    } catch (error) {
      console.error('Error fertilizing plant:', error);
      throw error;
    }
  },

  prunePlant: async (plantId, data = {}) => {
    try {
      const response = await axiosInstance.post(`/plants/${plantId}/prune`, {
        notes: data.notes,
        pruningType: data.pruningType
      });
      return response.data;
    } catch (error) {
      console.error('Error pruning plant:', error);
      throw error;
    }
  },

  getPlantSchedule: async (plantId) => {
    try {
      const response = await axiosInstance.get(`/plants/${plantId}/schedule`);
      return response.data;
    } catch (error) {
      console.error('Error fetching plant schedule:', error);
      throw error;
    }
  }
};

// Weather API endpoints
export const weatherAPI = {
  getCurrentWeather: async (location) => {
    try {
      const token = localStorage.getItem('authToken');
      const params = location ? `?location=${encodeURIComponent(location)}` : '';
      const response = await fetch(`${API_URL}/weather${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Weather API error: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Weather API Error:', error);
      throw error;
    }
  },

  getWeatherRecommendations: async (location) => {
    try {
      const token = localStorage.getItem('authToken');
      const params = location ? `?location=${encodeURIComponent(location)}` : '';
      const response = await fetch(`${API_URL}/weather/recommendations${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Weather recommendations error: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Weather Recommendations API Error:', error);
      throw error;
    }
  },

  getWeatherForecast: async (location) => {
    try {
      const token = localStorage.getItem('authToken');
      const params = location ? `?location=${encodeURIComponent(location)}` : '';
      const response = await fetch(`${API_URL}/weather/forecast${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Weather forecast error: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Weather Forecast API Error:', error);
      throw error;
    }
  },

  searchLocations: async (query) => {
    try {
      const token = localStorage.getItem('authToken');
      const params = query ? `?q=${encodeURIComponent(query)}` : '';
      const response = await fetch(`${API_URL}/weather/search${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Location search error: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Location Search API Error:', error);
      throw error;
    }
  }
};

// Add reminder API methods
export const reminderAPI = {
  // Get all reminders
  getReminders: async () => {
    try {
      const response = await axiosInstance.get('/reminders');
      console.log('Fetched reminders:', response.data); // Add debug logging
      return response.data;
    } catch (error) {
      console.error('Error fetching reminders:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Create new reminder
  createReminder: async (reminderData) => {
    try {
      // Map frequency strings to numbers that backend expects
      const frequencyMap = {
        'daily': 1,
        'weekly': 7,
        'biweekly': 14,
        'monthly': 30,
        'quarterly': 90,
        'yearly': 365
      };

      // Transform the data to match backend schema
      const transformedData = {
        plant: reminderData.plant,
        type: reminderData.type,
        title: reminderData.title || `${reminderData.type} reminder`,
        notes: reminderData.notes || `${reminderData.type} reminder for plant`,
        scheduledDate: reminderData.scheduledDate,
        recurring: reminderData.recurring !== false,
        frequency: frequencyMap[reminderData.frequency] || frequencyMap['weekly'],
        notificationMethods: reminderData.notificationMethods || ['popup']
      };

      console.log('Creating reminder with data:', transformedData);
      const response = await axiosInstance.post('/reminders', transformedData);
      console.log('Created reminder response:', response.data); // Add debug logging
      return response.data;
    } catch (error) {
      console.error('Error creating reminder:', error);
      console.error('Error response:', error.response?.data);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Delete reminder
  deleteReminder: async (reminderId) => {
    try {
      const response = await axiosInstance.delete(`/reminders/${reminderId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Get due reminders
  getDueReminders: async () => {
    try {
      const response = await axiosInstance.get('/reminders/due');
      console.log('Fetched due reminders:', response.data); // Add debug logging
      return response.data;
    } catch (error) {
      console.error('Error fetching due reminders:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Mark notification as sent
  markNotificationSent: async (reminderId) => {
    try {
      const response = await axiosInstance.put(`/reminders/${reminderId}/notification-sent`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification sent:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Complete reminder
  completeReminder: async (reminderId) => {
    try {
      const response = await axiosInstance.put(`/reminders/${reminderId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing reminder:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }
};

// Export uploadToCloudinary for use in other components
export { uploadToCloudinary };

// Update the main api object to include reminder methods and additional exports
const apiService = {
  // Reminder methods (for backward compatibility)
  getReminders: reminderAPI.getReminders,
  createReminder: reminderAPI.createReminder,
  deleteReminder: reminderAPI.deleteReminder,
  getDueReminders: reminderAPI.getDueReminders,
  markNotificationSent: reminderAPI.markNotificationSent,
  completeReminder: reminderAPI.completeReminder,
  
  // Add utility function
  uploadToCloudinary
};

export default apiService;
