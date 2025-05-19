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
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
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
  
  // Create a new plant
  createPlant: async (plantData) => {
    const response = await api.post('/plants', plantData);
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
      } else if (typeof imageData === 'string' && imageData.startsWith('http')) {
        // If it's a URL, you'll need to fetch and convert it to base64
        console.log("URLs aren't directly supported by this implementation, please provide base64 image data");
        throw new Error("Image URLs not supported directly");
      } else if (typeof imageData === 'string') {
        // If it's base64 without the prefix, add it
        base64Data = `data:image/jpeg;base64,${imageData}`;
      }
      
      // Create payload according to plant.id API
      const payload = {
        images: [base64Data],
        latitude: null,  // Optional: add actual coordinates if available
        longitude: null,
        similar_images: true
      };
      
      console.log("Sending plant identification request to Plant.id API");
      
      // Explicitly include Api-Key header instead of Bearer token
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': plantIdApiKey
        }
      };
      
      // Make the API call to plant.id directly
      const response = await axios.post('https://plant.id/api/v3/identification', payload, config);
      
      return response;
    } catch (err) {
      console.error("Plant identification error:", err);
      if (err.response) {
        console.log("Error response data:", err.response.data);
        console.log("Error response status:", err.response.status);
        console.log("Error response headers:", err.response.headers);
      }
      throw err;
    }
  }
};

export default api;
