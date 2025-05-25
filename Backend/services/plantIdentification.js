const axios = require('axios');

const PLANT_ID_API_KEY = process.env.PLANT_ID_API_KEY;
const PLANT_ID_BASE_URL = 'https://api.plant.id/v3';

// Check if API key is available
if (!PLANT_ID_API_KEY) {
  console.warn('⚠️  Warning: PLANT_ID_API_KEY not found in environment variables');
  console.warn('   Plant identification features will not work without a valid API key');
}

// Identify plant by base64 image
exports.identifyPlantByBase64 = async (base64Image) => {
  try {
    if (!PLANT_ID_API_KEY) {
      throw new Error('Plant identification service not configured - missing API key');
    }

    console.log('🔍 Sending plant identification request to Plant.ID API...');

    const response = await axios.post(`${PLANT_ID_BASE_URL}/identification`, {
      images: [`data:image/jpeg;base64,${base64Image}`],
      // Use correct modifiers for Plant.ID API v3
      similar_images: true,
      classification_level: "all"
    }, {
      headers: {
        'Api-Key': PLANT_ID_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    console.log('✅ Plant identification successful');
    return response.data;
  } catch (error) {
    console.error('❌ Plant.ID API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Invalid API key for plant identification service');
    } else if (error.response?.status === 429) {
      throw new Error('Too many requests to plant identification service');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Plant identification service timeout');
    } else if (error.response?.status === 402) {
      throw new Error('Plant identification service quota exceeded');
    } else {
      throw new Error('Failed to identify plant using Plant.ID API');
    }
  }
};

// Identify plant by image URL
exports.identifyPlantByUrl = async (imageUrl) => {
  try {
    if (!PLANT_ID_API_KEY) {
      throw new Error('Plant identification service not configured - missing API key');
    }

    console.log('🔍 Sending plant identification request (URL) to Plant.ID API...');

    const response = await axios.post(`${PLANT_ID_BASE_URL}/identification`, {
      images: [imageUrl],
      // Use correct modifiers for Plant.ID API v3
      similar_images: true,
      classification_level: "all"
    }, {
      headers: {
        'Api-Key': PLANT_ID_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ Plant identification (URL) successful');
    return response.data;
  } catch (error) {
    console.error('❌ Plant.ID API Error (URL):', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Invalid API key for plant identification service');
    } else if (error.response?.status === 429) {
      throw new Error('Too many requests to plant identification service');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Plant identification service timeout');
    } else if (error.response?.status === 402) {
      throw new Error('Plant identification service quota exceeded');
    } else {
      throw new Error('Failed to identify plant using Plant.ID API');
    }
  }
};

// Search plant by name - Use knowledge base endpoint
exports.searchPlantByName = async (plantName) => {
  try {
    if (!PLANT_ID_API_KEY) {
      throw new Error('Plant search service not configured - missing API key');
    }

    console.log('🔍 Searching for plant by name:', plantName);

    // Use the Plant.ID knowledge base search endpoint
    const response = await axios.get(`${PLANT_ID_BASE_URL}/kb/plants/name_search`, {
      params: {
        q: plantName,
        limit: 5
      },
      headers: {
        'Api-Key': PLANT_ID_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ Plant search successful');
    return response.data;
  } catch (error) {
    console.error('❌ Plant.ID Search API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Invalid API key for plant search service');
    } else if (error.response?.status === 429) {
      throw new Error('Too many requests to plant search service');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Plant search service timeout');
    } else if (error.response?.status === 402) {
      throw new Error('Plant search service quota exceeded');
    } else {
      throw new Error('Failed to search plant using Plant.ID API');
    }
  }
};

// Extract simplified plant data from API response
exports.extractPlantData = (apiResponse) => {
  if (!apiResponse || !apiResponse.result) {
    return null;
  }

  const result = apiResponse.result;
  
  if (result.classification && result.classification.suggestions) {
    const suggestions = result.classification.suggestions.map(suggestion => ({
      plant_name: suggestion.name,
      plant_common_names: suggestion.details?.common_names || [],
      probability: suggestion.probability,
      plant_details: suggestion.details
    }));

    return {
      suggestions,
      is_plant: result.is_plant || { probability: 0.5 }
    };
  }

  return null;
};

// Mock identification function for when API key is not available
exports.mockIdentifyPlant = async () => {
  console.log('🔧 Using mock plant identification (no API key configured)');
  
  return {
    result: {
      is_plant: { probability: 0.8, binary: true },
      classification: {
        suggestions: [
          {
            id: "mock-plant-id",
            name: "Epipremnum aureum",
            probability: 0.85,
            details: {
              common_names: ["Golden Pothos", "Devil's Ivy", "Money Plant"],
              description: {
                value: "This is a mock plant identification result. Epipremnum aureum, commonly known as Golden Pothos or Devil's Ivy, is a popular houseplant known for its heart-shaped leaves and trailing vines. Please configure your Plant.ID API key for real plant identification.",
                citation: "Mock data for development"
              },
              taxonomy: {
                kingdom: "Plantae",
                phylum: "Tracheophyta", 
                class: "Liliopsida",
                order: "Alismatales",
                family: "Araceae",
                genus: "Epipremnum",
                species: "E. aureum"
              },
              url: "https://en.wikipedia.org/wiki/Epipremnum_aureum",
              gbif_id: 2752880,
              inaturalist_id: 48384
            }
          }
        ]
      }
    }
  };
};
