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
      // Use only valid modifiers for Plant.ID API v3
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
    console.log('Raw response structure:', {
      hasResult: !!response.data.result,
      hasClassification: !!response.data.result?.classification,
      hasSuggestions: !!response.data.result?.classification?.suggestions,
      suggestionsCount: response.data.result?.classification?.suggestions?.length || 0
    });
    
    // Log the first suggestion structure
    if (response.data.result?.classification?.suggestions?.[0]) {
      const firstSuggestion = response.data.result.classification.suggestions[0];
      console.log('First suggestion structure:', {
        name: firstSuggestion.name,
        hasCommonNames: !!firstSuggestion.common_names,
        commonNamesCount: firstSuggestion.common_names?.length || 0,
        hasDetails: !!firstSuggestion.details,
        hasPlantId: !!firstSuggestion.plant_id,
        keys: Object.keys(firstSuggestion)
      });
    }
    
    // Try to enrich the response with additional plant details
    if (response.data && response.data.result && response.data.result.classification) {
      const suggestions = response.data.result.classification.suggestions;
      
      // For each suggestion, try to get additional details
      for (let i = 0; i < Math.min(suggestions.length, 2); i++) { // Limit to first 2
        const suggestion = suggestions[i];
        
        console.log(`Processing suggestion ${i + 1}: ${suggestion.name}`);
        console.log(`Plant ID available: ${!!suggestion.plant_id}`);
        console.log(`Existing common names: ${suggestion.common_names || 'None'}`);
        
        // If we already have common names, keep them
        if (suggestion.common_names && Array.isArray(suggestion.common_names) && suggestion.common_names.length > 0) {
          console.log(`✅ Already has common names: ${suggestion.common_names.join(', ')}`);
          continue;
        }
        
        // Try to fetch additional details using plant_id
        if (suggestion.plant_id) {
          try {
            console.log(`Fetching details for plant ID: ${suggestion.plant_id}`);
            const detailsResponse = await axios.get(`${PLANT_ID_BASE_URL}/kb/plants/${suggestion.plant_id}`, {
              headers: {
                'Api-Key': PLANT_ID_API_KEY,
                'Content-Type': 'application/json'
              },
              timeout: 10000
            });
            
            if (detailsResponse.data) {
              console.log(`Details response for ${suggestion.name}:`, {
                hasCommonNames: !!detailsResponse.data.common_names,
                commonNames: detailsResponse.data.common_names,
                hasDescription: !!detailsResponse.data.description,
                keys: Object.keys(detailsResponse.data)
              });
              
              suggestions[i].details = detailsResponse.data;
              
              // Add common names directly to the suggestion for easier access
              if (detailsResponse.data.common_names && Array.isArray(detailsResponse.data.common_names)) {
                // Ensure we're getting the actual string values, not objects
                const validCommonNames = detailsResponse.data.common_names.filter(name => 
                  typeof name === 'string' && name.trim().length > 0
                );
                
                if (validCommonNames.length > 0) {
                  suggestions[i].common_names = validCommonNames;
                  console.log(`✅ Added ${validCommonNames.length} valid common names to suggestion: ${validCommonNames.join(', ')}`);
                } else {
                  console.log(`⚠️ Common names found but none were valid strings`);
                }
              }
              
              // Also try to get description and other details
              if (detailsResponse.data.description) {
                suggestions[i].description = detailsResponse.data.description;
              }
              
              if (detailsResponse.data.taxonomy) {
                suggestions[i].taxonomy = detailsResponse.data.taxonomy;
              }
            }
          } catch (detailsError) {
            console.warn(`Could not fetch details for plant ${suggestion.plant_id}:`, detailsError.message);
          }
        }
        
        // Try alternative approach - search by scientific name to get common names
        if (!suggestions[i].common_names || suggestions[i].common_names.length === 0) {
          try {
            console.log(`Trying name search for: ${suggestion.name}`);
            const searchResponse = await axios.get(`${PLANT_ID_BASE_URL}/kb/plants/name_search`, {
              params: {
                q: suggestion.name,
                limit: 1
              },
              headers: {
                'Api-Key': PLANT_ID_API_KEY,
                'Content-Type': 'application/json'
              },
              timeout: 10000
            });
            
            if (searchResponse.data?.entities?.[0]?.common_names) {
              const searchCommonNames = searchResponse.data.entities[0].common_names.filter(name => 
                typeof name === 'string' && name.trim().length > 0
              );
              
              if (searchCommonNames.length > 0) {
                suggestions[i].common_names = searchCommonNames;
                console.log(`✅ Found common names via search: ${searchCommonNames.join(', ')}`);
              }
            }
          } catch (searchError) {
            console.warn(`Could not search for plant ${suggestion.name}:`, searchError.message);
          }
        }
      }
      
      // Log final structure
      console.log('Final suggestions with common names:');
      suggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion.name}`);
        console.log(`   Common names: ${suggestion.common_names ? suggestion.common_names.join(', ') : 'None'}`);
        console.log(`   Has details: ${!!suggestion.details}`);
      });
    }

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
    } else if (error.response?.status === 400) {
      console.error('Bad request details:', error.response.data);
      throw new Error('Invalid request to plant identification service');
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
      // Use only valid modifiers for Plant.ID API v3
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
    
    // Try to enrich the response with additional plant details
    if (response.data && response.data.result && response.data.result.classification) {
      const suggestions = response.data.result.classification.suggestions;
      
      // For each suggestion, try to get additional details if plant_id is available
      for (let i = 0; i < Math.min(suggestions.length, 3); i++) {
        const suggestion = suggestions[i];
        
        if (suggestion.plant_id) {
          try {
            console.log(`Fetching details for plant ID: ${suggestion.plant_id}`);
            const detailsResponse = await axios.get(`${PLANT_ID_BASE_URL}/kb/plants/${suggestion.plant_id}`, {
              headers: {
                'Api-Key': PLANT_ID_API_KEY,
                'Content-Type': 'application/json'
              },
              timeout: 10000
            });
            
            if (detailsResponse.data) {
              suggestions[i].details = detailsResponse.data;
              
              // Also add common names directly to the suggestion for easier access
              if (detailsResponse.data.common_names) {
                suggestions[i].common_names = detailsResponse.data.common_names;
              }
            }
          } catch (detailsError) {
            console.warn(`Could not fetch details for plant ${suggestion.plant_id}:`, detailsError.message);
          }
        }
      }
    }

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
    } else if (error.response?.status === 400) {
      console.error('Bad request details:', error.response.data);
      throw new Error('Invalid request to plant identification service');
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

    // Use the Plant.ID knowledge base search endpoint with detailed parameters
    const response = await axios.get(`${PLANT_ID_BASE_URL}/kb/plants/name_search`, {
      params: {
        q: plantName,
        limit: 5,
        details: 'true', // Request full details
        include_image_url: 'true', // Explicitly request image URLs
        include: 'images,common_names,description,taxonomy,wiki' // Request comprehensive data
      },
      headers: {
        'Api-Key': PLANT_ID_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ Plant search successful');
    
    // Enhanced logging for debugging image issues
    if (response.data.entities && response.data.entities.length > 0) {
      const firstEntity = response.data.entities[0];
      console.log('First search result keys:', Object.keys(firstEntity));
      
      // Check if images exist and log their structure
      if (firstEntity.images && firstEntity.images.length > 0) {
        console.log('First entity has images array with length:', firstEntity.images.length);
        console.log('First image structure:', firstEntity.images[0]);
      } else {
        console.log('No images array or empty images array in first entity');
      }
      
      // Check for alternative image sources
      if (firstEntity.image_url) {
        console.log('Found image_url property:', firstEntity.image_url);
      }
      
      // Enrich the response with additional image data if missing
      for (const entity of response.data.entities) {
        // If no images but there's an access token, try to fetch more details
        if ((!entity.images || entity.images.length === 0) && entity.access_token) {
          try {
            console.log(`Fetching detailed data for ${entity.matched_in} to get images...`);
            const detailsResponse = await exports.getPlantDetails(entity.access_token);
            
            if (detailsResponse && detailsResponse.images && detailsResponse.images.length > 0) {
              entity.images = detailsResponse.images;
              console.log(`✅ Found ${entity.images.length} images from details request`);
            }
          } catch (detailsError) {
            console.warn(`Could not fetch details for ${entity.matched_in}:`, detailsError.message);
          }
        }
        
        // Add a fallback image URL if we have one but no images array
        if (entity.image_url && (!entity.images || entity.images.length === 0)) {
          entity.images = [{ url: entity.image_url }];
          console.log('Created images array from image_url property');
        }
      }
    } else {
      console.log('No entities found in search response');
    }
    
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

// Mock identification function - only used when no API key is configured
exports.mockIdentifyPlant = async () => {
  console.log('🔧 Using mock plant identification (no API key configured)');
  console.log('⚠️  To use real plant identification, please configure PLANT_ID_API_KEY in your environment variables');
  
  return {
    result: {
      is_plant: { probability: 0.8, binary: true },
      classification: {
        suggestions: [
          {
            id: "mock-example-plant",
            name: "Example Plant Species",
            probability: 0.75,
            common_names: ["Example Plant", "Demo Plant", "Test Plant"],
            description: "This is a mock plant identification result. Please configure your Plant.ID API key to get real plant identification results.",
            taxonomy: {
              kingdom: "Plantae",
              phylum: "Tracheophyta", 
              class: "Magnoliopsida",
              order: "Example Order",
              family: "Example Family",
              genus: "Example",
              species: "E. example"
            },
            url: "https://example.com/mock-plant",
            details: {
              common_names: ["Example Plant", "Demo Plant", "Test Plant"],
              description: {
                value: "This is a mock plant identification result. Please configure your Plant.ID API key to get real plant identification results from the Plant.ID service."
              },
              taxonomy: {
                kingdom: "Plantae",
                phylum: "Tracheophyta", 
                class: "Magnoliopsida",
                order: "Example Order",
                family: "Example Family",
                genus: "Example",
                species: "E. example"
              },
              url: "https://example.com/mock-plant"
            }
          }
        ]
      }
    }
  };
};

// Get detailed plant information using access token
exports.getPlantDetails = async (accessToken) => {
  try {
    if (!PLANT_ID_API_KEY) {
      throw new Error('Plant details service not configured - missing API key');
    }

    console.log('🔍 Fetching plant details using access token...');

    const response = await axios.get(`${PLANT_ID_BASE_URL}/kb/plants/${accessToken}`, {
      headers: {
        'Api-Key': PLANT_ID_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    console.log('✅ Plant details fetched successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Plant Details API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Invalid API key for plant details service');
    } else if (error.response?.status === 404) {
      throw new Error('Plant details not found');
    } else if (error.response?.status === 429) {
      throw new Error('Too many requests to plant details service');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Plant details service timeout');
    } else if (error.response?.status === 402) {
      throw new Error('Plant details service quota exceeded');
    } else {
      throw new Error('Failed to fetch plant details using Plant.ID API');
    }
  }
};

/**
 * Get plant care recommendations based on plant details
 */
exports.getPlantCareRecommendations = (plantDetails) => {
  const recommendations = {
    watering: "Water when the top inch of soil feels dry to touch.",
    fertilizing: "Feed with balanced liquid fertilizer every 2-4 weeks during growing season.",
    pruning: "Remove dead or yellowing leaves as needed. Prune for shape in spring.",
    sunlight: "Provide bright, indirect light for optimal growth.",
    soil: "Use well-draining potting mix with good organic content.",
    humidity: "Maintain moderate humidity levels (40-60%).",
    temperature: "Keep in temperatures between 65-80°F (18-27°C)."
  };
  
  // Customize recommendations based on plant family if available
  if (plantDetails.taxonomy?.family) {
    const family = plantDetails.taxonomy.family.toLowerCase();
    
    if (family.includes('cactaceae') || family.includes('succulent')) {
      recommendations.watering = "Water sparingly, allow soil to dry completely between waterings.";
      recommendations.humidity = "Prefers low humidity environments.";
    } else if (family.includes('araceae')) {
      recommendations.humidity = "Enjoys higher humidity levels (50-70%).";
      recommendations.watering = "Keep soil consistently moist but not waterlogged.";
    } else if (family.includes('ficus') || family.includes('moraceae')) {
      recommendations.pruning = "Prune regularly to maintain shape. Can handle heavy pruning.";
      recommendations.sunlight = "Prefers bright, indirect to direct light.";
    }
  }
  
  return recommendations;
};

/**
 * Calculate next care date based on frequency
 */
exports.calculateNextCareDate = (lastCareDate, frequencyDays) => {
  if (!lastCareDate || !frequencyDays) return null;
  
  const lastDate = new Date(lastCareDate);
  const nextDate = new Date(lastDate);
  nextDate.setDate(lastDate.getDate() + frequencyDays);
  
  return nextDate;
};
