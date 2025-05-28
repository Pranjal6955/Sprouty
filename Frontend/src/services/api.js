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
      console.error('Error creating plant:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Get all plants for the current user
  getAllPlants: async () => {
    try {
      const response = await axiosInstance.get('/plants');
      return response.data;
    } catch (error) {
      console.error('Error fetching plants:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Get all plants (alias for getAllPlants for compatibility)
  getPlants: async () => {
    try {
      const response = await axiosInstance.get('/plants');
      return response.data;
    } catch (error) {
      console.error('Error fetching plants:', error);
      return { success: false, error: error.response?.data?.error || error.message };
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
      console.error('Error updating plant:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Delete a plant
  deletePlant: async (plantId) => {
    try {
      const response = await axiosInstance.delete(`/plants/${plantId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting plant:', error);
      return { success: false, error: error.response?.data?.error || error.message };
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
      console.log('Fetched reminders:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching reminders:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Create new reminder - updated to match backend schema
  createReminder: async (reminderData) => {
    try {
      // Transform the data to match backend schema exactly
      const transformedData = {
        plant: reminderData.plant,
        type: reminderData.type,
        title: reminderData.title || `${reminderData.type} reminder`,
        notes: reminderData.notes || `${reminderData.type} reminder for plant`,
        scheduledDate: reminderData.scheduledDate,
        recurring: reminderData.recurring !== false,
        frequency: reminderData.frequency === 'daily' ? 1 : 
                  reminderData.frequency === 'weekly' ? 7 :
                  reminderData.frequency === 'monthly' ? 30 :
                  parseInt(reminderData.frequency) || 7,
        notificationMethods: reminderData.notificationMethods || ['popup']
      };

      console.log('Creating reminder with data:', transformedData);
      const response = await axiosInstance.post('/reminders', transformedData);
      console.log('Created reminder response:', response.data);
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
      console.log('Fetched due reminders:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching due reminders:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Get upcoming reminders
  getUpcomingReminders: async () => {
    try {
      const response = await axiosInstance.get('/reminders/upcoming');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming reminders:', error);
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
  },

  // Update reminder
  updateReminder: async (reminderId, updateData) => {
    try {
      const response = await axiosInstance.put(`/reminders/${reminderId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  },
};

// Add diagnosis API endpoints
export const diagnosisAPI = {
  diagnoseDisease: async (diagnosisData) => {
    try {
      // Log the type of data being sent for diagnosis
      if (diagnosisData.base64Image) {
        console.log('Sending base64 image for diagnosis. Length:', diagnosisData.base64Image.length);
        console.log('First 20 chars of base64:', diagnosisData.base64Image.substring(0, 20) + '...');
      } else if (diagnosisData.imageUrl) {
        console.log('Sending image URL for diagnosis:', diagnosisData.imageUrl);
      }

      // Create an AbortController to allow aborting the request if it takes too long
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.warn('Diagnosis request aborted due to timeout');
      }, 60000); // 60 second hard timeout

      console.log('Starting diagnosis API call...');
      // Add timeout to prevent hanging requests
      const response = await axiosInstance.post('/diagnosis/diagnose', diagnosisData, {
        timeout: 60000, // 60 second timeout to allow for slow API responses
        signal: controller.signal
      });
      
      // Clear the abort timeout since we got a response
      clearTimeout(timeoutId);
      
      console.log('Diagnosis response received successfully:', {
        success: response.data.success,
        dataPresent: !!response.data.data
      });
      
      return response.data;
    } catch (error) {
      console.error('Error diagnosing plant disease:', error);
      
      // Check if the request was aborted due to timeout
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        console.error('Diagnosis request timed out');
        throw new Error('The diagnosis request timed out. Please try again with a smaller image or check your internet connection.');
      }
      
      // Enhanced error handling for API key issues
      if (error.response?.data?.error?.includes('api key') || 
          error.response?.data?.error?.includes('API key')) {
        throw new Error('Plant disease diagnosis requires a valid Plant.ID API key. Please contact the administrator to enable this feature.');
      }
      
      // Handle network connectivity issues
      if (!error.response) {
        throw new Error('Could not connect to diagnosis service. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  },

  getPlantDiagnosisHistory: async (plantId) => {
    try {
      const response = await axiosInstance.get(`/diagnosis/plant/${plantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching diagnosis history:', error);
      throw error;
    }
  },

  getUserDiagnosisHistory: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/diagnosis/history', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user diagnosis history:', error);
      throw error;
    }
  },

  getDiagnosis: async (diagnosisId) => {
    try {
      const response = await axiosInstance.get(`/diagnosis/${diagnosisId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching diagnosis:', error);
      throw error;
    }
  },

  updateDiagnosis: async (diagnosisId, updateData) => {
    try {
      const response = await axiosInstance.put(`/diagnosis/${diagnosisId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating diagnosis:', error);
      throw error;
    }
  },

  deleteDiagnosis: async (diagnosisId) => {
    try {
      const response = await axiosInstance.delete(`/diagnosis/${diagnosisId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting diagnosis:', error);
      throw error;
    }
  },

  getDiagnosisStats: async () => {
    try {
      const response = await axiosInstance.get('/diagnosis/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching diagnosis stats:', error);
      throw error;
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
