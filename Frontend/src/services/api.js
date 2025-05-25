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
    try {
      console.log('Creating plant with data:', plantData);
      
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
      
      const response = await api.post('/plants', processedData);
      console.log('Plant created successfully:', response.data);
      return response.data.data; // Return the plant data from the response
    } catch (error) {
      console.error('Create plant API error:', error);
      
      if (error.response) {
        throw new Error(error.response.data?.error || 'Failed to create plant');
      } else if (error.request) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error('Failed to create plant');
      }
    }
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
  
  // Plant identification endpoint
  identifyPlant: async (imageData) => {
    try {
      console.log('Making plant identification request...');
      
      // Convert data URL to base64 if needed
      let base64Image = imageData;
      if (imageData.startsWith('data:')) {
        base64Image = imageData.split(',')[1];
      }
      
      const response = await api.post('/plants/identify', {
        base64Image: base64Image
      });
      
      console.log('Plant identification response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Plant identification API error:', error);
      
      // Provide more specific error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        // Handle specific server errors
        if (error.response.status === 500) {
          throw new Error('Plant identification service is currently unavailable. Please try again later or enter plant details manually.');
        }
        
        throw new Error(error.response.data?.error || 'Failed to identify plant');
      } else if (error.request) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error('Failed to identify plant');
      }
    }
  },

  // Text-based plant search endpoint
  searchPlantByName: async (plantName) => {
    try {
      console.log('Making plant search request for:', plantName);
      
      const response = await api.get(`/plants/search?name=${encodeURIComponent(plantName)}`);
      
      console.log('Plant search response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Plant search API error:', error);
      
      if (error.response) {
        if (error.response.status === 500) {
          throw new Error('Plant search service is currently unavailable. Please try again later.');
        }
        throw new Error(error.response.data?.error || 'Failed to search plants');
      } else if (error.request) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error('Failed to search plants');
      }
    }
  }
};
