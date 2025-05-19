const axios = require('axios');

/**
 * Plant.id API base URL from environment variable
 */
const API_URL = process.env.PLANT_ID_API_URL || 'https://plant.id/api/v3/identification';

/**
 * Identify a plant from an image URL
 * @param {string} imageUrl - URL of the plant image
 * @param {object} options - Additional options for identification
 * @returns {Promise<object>} - Identification results
 */
exports.identifyPlantByUrl = async (imageUrl, options = {}) => {
  try {
    const apiKey = process.env.PLANT_ID_API_KEY;
    
    if (!apiKey) {
      throw new Error('Plant identification API key not configured');
    }
    
    console.log(`Using Plant ID API at: ${API_URL}`);
    console.log(`Using API key: ${apiKey.substring(0, 10)}...`);
    console.log(`Identifying plant with image URL: ${imageUrl}`);
    
    // Format payload for Plant ID v3 API - this is the correct format for v3
    const requestData = {
      images: [imageUrl],
      // Optional parameters
      latitude: options.latitude,
      longitude: options.longitude,
      similar_images: true
    };
    
    console.log('Sending request to Plant ID API with payload:', JSON.stringify(requestData));
    
    // Send request with proper headers for v3 API
    const response = await axios.post(API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey  // The v3 API uses Api-Key header
      }
    });
    
    console.log('Plant ID API returned status:', response.status);
    console.log('Plant ID API response preview:', JSON.stringify(response.data).substring(0, 200) + '...');
    
    return response.data;
  } catch (error) {
    console.error('Plant identification error:', error.message);
    
    // Enhanced error logging
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data));
      console.error('Error headers:', JSON.stringify(error.response.headers));
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    throw error;
  }
};

/**
 * Identify a plant from a base64 image string
 * @param {string} base64Image - Base64 encoded image
 * @param {object} options - Additional options for identification
 * @returns {Promise<object>} - Identification results
 */
exports.identifyPlantByBase64 = async (base64Image, options = {}) => {
  try {
    const apiKey = process.env.PLANT_ID_API_KEY;
    
    if (!apiKey) {
      throw new Error('Plant identification API key not configured');
    }
    
    console.log('Identifying plant with base64 image');
    
    // Remove data URL prefix if present
    const imageData = base64Image.startsWith('data:image')
      ? base64Image.split(',')[1]
      : base64Image;
    
    // Format payload for Plant ID v3 API
    const requestData = {
      images: [imageData],
      // Optional parameters
      latitude: options.latitude,
      longitude: options.longitude,
      similar_images: true
    };
    
    console.log('Sending base64 image to Plant ID API');
    
    // Send request with proper headers for v3 API
    const response = await axios.post(API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey
      }
    });
    
    console.log('Plant ID API returned status:', response.status);
    
    return response.data;
  } catch (error) {
    console.error('Plant identification error:', error.message);
    
    // Enhanced error logging
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data));
    }
    
    throw error;
  }
};

/**
 * Process identification results to extract useful plant data
 * @param {object} identificationResults - Results from identification API
 * @returns {object} - Simplified plant data
 */
exports.extractPlantData = (identificationResults) => {
  try {
    console.log('Extracting plant data from results');
    
    // Handle the v3 API response format which is different from v2
    if (identificationResults.result && identificationResults.result.classification) {
      const suggestions = identificationResults.result.classification.suggestions;
      
      if (!suggestions || suggestions.length === 0) {
        console.log('No plant suggestions found in the results');
        return null;
      }
      
      // Get the top suggestion
      const topMatch = suggestions[0];
      console.log('Top match:', topMatch.name, 'with confidence', topMatch.probability);
      
      // Extract common names
      const commonNames = topMatch.details?.common_names || [];
      
      // Build a simplified plant data object
      return {
        scientificName: topMatch.name,
        commonName: commonNames.length > 0 ? commonNames[0] : topMatch.name,
        allCommonNames: commonNames,
        confidence: topMatch.probability,
        description: topMatch.details?.description || '',
        taxonomy: topMatch.details?.taxonomy || {},
        wikiUrl: topMatch.details?.url || ''
      };
    }
    
    // Log if the response format doesn't match expectations
    console.log('Unexpected response format from Plant ID API:', 
                JSON.stringify(identificationResults).substring(0, 200) + '...');
    return null;
  } catch (error) {
    console.error('Error extracting plant data:', error);
    return null;
  }
};
