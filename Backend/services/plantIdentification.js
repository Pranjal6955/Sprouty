const axios = require('axios');

/**
 * Plant.id API base URL
 */
const API_URL = 'https://api.plant.id/v2/identify';

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
    
    const requestData = {
      api_key: apiKey,
      images: [imageUrl],
      modifiers: options.modifiers || ["crops_fast", "similar_images"],
      plant_language: options.language || "en",
      plant_details: options.details || [
        "common_names", 
        "url", 
        "wiki_description", 
        "taxonomy", 
        "synonyms"
      ]
    };
    
    const response = await axios.post(API_URL, requestData);
    return response.data;
  } catch (error) {
    console.error('Plant identification error:', error);
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
    
    // Remove data URL prefix if present
    const imageData = base64Image.startsWith('data:image')
      ? base64Image.split(',')[1]
      : base64Image;
    
    const requestData = {
      api_key: apiKey,
      images: [imageData],
      modifiers: options.modifiers || ["crops_fast", "similar_images"],
      plant_language: options.language || "en",
      plant_details: options.details || [
        "common_names", 
        "url", 
        "wiki_description", 
        "taxonomy", 
        "synonyms"
      ]
    };
    
    const response = await axios.post(API_URL, requestData);
    return response.data;
  } catch (error) {
    console.error('Plant identification error:', error);
    throw error;
  }
};

/**
 * Process identification results to extract useful plant data
 * @param {object} identificationResults - Results from identification API
 * @returns {object} - Simplified plant data
 */
exports.extractPlantData = (identificationResults) => {
  if (!identificationResults.suggestions || identificationResults.suggestions.length === 0) {
    return null;
  }
  
  // Get the top suggestion
  const topMatch = identificationResults.suggestions[0];
  
  // Extract common names
  const commonNames = topMatch.plant_details.common_names || [];
  
  // Build a simplified plant data object
  return {
    scientificName: topMatch.plant_name,
    commonName: commonNames.length > 0 ? commonNames[0] : topMatch.plant_name,
    allCommonNames: commonNames,
    confidence: topMatch.probability,
    description: topMatch.plant_details.wiki_description?.value || '',
    taxonomy: topMatch.plant_details.taxonomy || {},
    similarImages: topMatch.similar_images || [],
    wikiUrl: topMatch.plant_details.url || ''
  };
};
