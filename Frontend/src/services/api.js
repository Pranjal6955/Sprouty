import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL || 'https://api.cloudinary.com/v1_1/';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
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
    
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    // Support both standard and OAuth logins
    if (credentials.oAuthProvider) {
      console.log(`Login with ${credentials.oAuthProvider} OAuth`);
    }
    
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  verifyToken: async () => {
    const response = await api.get('/auth/verify-token');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgotpassword', { email });
    return response.data;
  },
  
  resetPassword: async (resetToken, password) => {
    const response = await api.put(`/auth/resetpassword/${resetToken}`, { password });
    return response.data;
  },

  // New method to link Firebase and backend accounts if needed
  linkAccounts: async (firebaseUid) => {
    const response = await api.post('/auth/link-accounts', { firebaseUid });
    return response.data;
  }
};

// User Services
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  updatePassword: async (passwordData) => {
    const response = await api.put('/users/password', passwordData);
    return response.data;
  },
  
  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  }
};

// Plant Services
export const plantAPI = {
  // Get all plants
  getPlants: async () => {
    const response = await api.get('/plants');
    return response.data;
  },
  
  // Get single plant by ID
  getPlant: async (plantId) => {
    const response = await api.get(`/plants/${plantId}`);
    return response.data;
  },
  
  // Create a new plant with proper image handling
  createPlant: async (plantData) => {
    // Check if we need to upload the image to Cloudinary first
    let processedData = { ...plantData };
    
    // If mainImage is a base64 or data URL, upload to Cloudinary
    if (plantData.mainImage && typeof plantData.mainImage === 'string' && 
        (plantData.mainImage.startsWith('data:') || plantData.mainImage.startsWith('base64'))) {
      try {
        console.log("Uploading plant image to Cloudinary...");
        const imageUrl = await uploadToCloudinary(plantData.mainImage);
        processedData.mainImage = imageUrl;
        
        // Also add to images array as per backend model
        processedData.images = [{ url: imageUrl }];
      } catch (err) {
        console.error("Error uploading image:", err);
        throw new Error("Failed to upload plant image");
      }
    }
    
    console.log("Creating plant with processed data:", processedData);
    const response = await api.post('/plants', processedData);
    return response.data;
  },
  
  // Update a plant
  updatePlant: async (plantId, plantData) => {
    const response = await api.put(`/plants/${plantId}`, plantData);
    return response.data;
  },
  
  // Delete a plant
  deletePlant: async (plantId) => {
    const response = await api.delete(`/plants/${plantId}`);
    return response.data;
  },
  
  // Update plant care history
  updateCareHistory: async (plantId, careData) => {
    const response = await api.put(`/plants/${plantId}/care`, careData);
    return response.data;
  },
  
  // Add a growth milestone
  addGrowthMilestone: async (plantId, milestoneData) => {
    const response = await api.post(`/plants/${plantId}/growth`, milestoneData);
    return response.data;
  },
  
  /**
   * Send a plant image to the backend for identification
   * @param {string} imageData - Either a URL or base64 image data
   * @returns {Promise<object>} - Plant identification results
   */
  identifyPlant: async (imageData) => {
    try {
      console.log("Plant identification initiated");
      
      // Get API key from environment or config
      const plantIdApiKey = import.meta.env.VITE_PLANT_ID_API_KEY;
      
      if (!plantIdApiKey) {
        console.warn("WARNING: No Plant.id API key found!");
        throw new Error("Plant.id API key is missing");
      }
      
      // Format the image data properly
      let base64Data = imageData;
      if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
        // Image is already in proper format
        base64Data = imageData.split(',')[1]; // Extract the base64 part
      } else if (typeof imageData === 'string' && imageData.startsWith('http')) {
        // Send the URL directly to backend for processing
        const response = await api.post('/plants/identify', { imageUrl: imageData });
        return response.data;
      } else if (typeof imageData === 'string') {
        // If it's base64 without the prefix, use as is
        base64Data = imageData;
      }
      
      // Create payload according to plant.id API format
      const payload = {
        images: [`data:image/jpeg;base64,${base64Data}`],
        latitude: null,  // Optional: add actual coordinates if available
        longitude: null,
        similar_images: true
      };
      
      console.log("Sending plant identification request to backend");
      
      // Send to backend for identification instead of directly to Plant.id
      const response = await api.post('/plants/identify', { base64Image: base64Data });
      
      return response.data;
    } catch (err) {
      console.error("Plant identification error:", err);
      if (err.response) {
        console.log("Error response data:", err.response.data);
        console.log("Error response status:", err.response.status);
      }
      throw err;
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
  }
};

export default api;
