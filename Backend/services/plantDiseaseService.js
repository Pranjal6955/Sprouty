const axios = require('axios');

const PLANT_ID_API_KEY = process.env.PLANT_ID_API_KEY;
const PLANT_ID_BASE_URL = 'https://api.plant.id/v3';

// Enhanced API key validation
const validateApiKey = () => {
  if (!PLANT_ID_API_KEY) {
    console.warn('⚠️  Warning: PLANT_ID_API_KEY not found in environment variables');
    return false;
  }
  
  // Basic API key format validation
  if (PLANT_ID_API_KEY.length < 20) {
    console.warn('⚠️  Warning: Plant.ID API key seems to short, please verify it');
    return false;
  }
  
  // Check if it's still the placeholder
  if (PLANT_ID_API_KEY === 'your_actual_api_key_here' || 
      PLANT_ID_API_KEY === 'your_plant_id_api_key_here') {
    console.warn('⚠️  Warning: Plant.ID API key is still set to placeholder value');
    return false;
  }
  
  return true;
};

// Log API key status on service load
if (validateApiKey()) {
  console.log('✅ Plant.ID API key configured and appears valid');
} else {
  console.warn('❌ Plant.ID API key is not properly configured');
  console.warn('   To enable real plant disease diagnosis:');
  console.warn('   1. Sign up at https://web.plant.id/');
  console.warn('   2. Get your API key from the dashboard');
  console.warn('   3. Add PLANT_ID_API_KEY=your_key_here to your .env file');
  console.warn('   4. Restart the server');
}

/**
 * Diagnose plant disease from base64 image using Plant.ID Health Assessment API
 */
exports.diagnosePlantDiseaseByBase64 = async (base64Image, modifiers = []) => {
  try {
    if (!validateApiKey()) {
      throw new Error('Plant.ID API key not configured or invalid. Please check your .env file.');
    }

    console.log('🔍 Sending plant disease diagnosis request to Plant.ID Health Assessment API...');
    console.log('Image data size:', base64Image ? base64Image.length : 'N/A');
    
    // Check if base64Image already includes the data:image prefix
    let imageData;
    try {
      imageData = base64Image.startsWith('data:image') 
        ? base64Image 
        : `data:image/jpeg;base64,${base64Image}`;
      console.log('Image data prepared successfully');
    } catch (error) {
      console.error('❌ Error preparing image data:', error);
      throw new Error('Failed to prepare image data for API request');
    }
    
    console.log('Using endpoint:', `${PLANT_ID_BASE_URL}/health_assessment`);
    console.log('Preparing request with images array...');

    // FIXED: Use only valid parameters listed in the error message
    const requestData = {
      images: [imageData],
      health: 'all',          // Supported parameter
      similar_images: true    // Supported parameter
      // Removed the unsupported 'modifiers' parameter
    };

    console.log('Request data prepared, making API call...');

    // Use a more robust error handling approach with timeouts
    try {
      console.log('Starting axios request to Plant.ID API...');
      
      // Log the full request payload for debugging
      console.log('Request payload:', JSON.stringify({
        ...requestData,
        images: ['[IMAGE DATA REDACTED]'] // Don't log the full image data
      }));
      
      const apiUrl = `${PLANT_ID_BASE_URL}/health_assessment`;
      console.log('Complete API URL:', apiUrl);
      
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          'Api-Key': PLANT_ID_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 40000 // 40 second timeout
      });
      
      console.log('✅ Received response from Plant.ID API');
      
      // Add more detailed logging of the response structure
      console.log('Response status:', response.status);
      console.log('Response has data:', !!response.data);
      console.log('Response has result:', !!response.data?.result);
      console.log('Response has health_assessment:', !!response.data?.result?.health_assessment);
      
      if (response.data?.result?.health_assessment) {
        const health = response.data.result.health_assessment;
        console.log('Plant health status:', health.is_healthy ? 'Healthy' : 'Issues detected');
        console.log('Number of diseases found:', health.diseases?.length || 0);
        
        if (health.diseases && health.diseases.length > 0) {
          console.log('Disease detected:', health.diseases[0].name);
        } else {
          console.log('No specific diseases detected in the image');
        }
      }
      
      // Full response logging for debugging (with sensitive data removed)
      console.log('Full API response structure:', JSON.stringify(
        response.data, 
        (key, value) => {
          // Don't log image data or API keys
          if (key === 'images' || key === 'Api-Key') return '[REDACTED]';
          return value;
        }, 
        2
      ).substring(0, 1000) + '...');
      
      if (!response.data || !response.data.result) {
        console.warn('⚠️ Response from Plant.ID API is missing expected data structure');
        console.log('Response data:', JSON.stringify(response.data).substring(0, 200) + '...');
      }
      
      console.log('✅ Plant disease diagnosis successful');
      return response.data;
    }
    catch (apiError) {
      console.error('❌ Plant.ID API request failed:', apiError.message);
      if (apiError.response) {
        console.error('API response status:', apiError.response.status);
        console.error('API response data:', apiError.response.data);
      } else if (apiError.request) {
        console.error('No response received from API');
      }
      throw apiError; // Re-throw to be handled by the outer catch
    }
  }
  catch (error) {
    // Handle connection timeout
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Plant.ID API request timed out');
      throw new Error('Plant.ID API request timed out. Please try again with a smaller image.');
    }
    
    console.error('❌ Plant.ID Health Assessment API Error:', error.response?.data || error.message);
    
    // Try with minimal properties - last resort
    if (error.response?.status === 400) {
      console.log('🔄 Retrying with minimal request format...');
      
      // Only use the essential parameters that we know are valid
      const basicRequestData = {
        images: [base64Image.startsWith('data:image') ? base64Image : `data:image/jpeg;base64,${base64Image}`],
        health: 'all'  // Only include this essential property
      };

      try {
        console.log('Making last-resort request with minimal data...');
        const retryResponse = await axios.post(`${PLANT_ID_BASE_URL}/health_assessment`, basicRequestData, {
          headers: {
            'Api-Key': PLANT_ID_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        });

        console.log('✅ Retry attempt successful');
        return retryResponse.data;
      } catch (retryError) {
        console.error('❌ Retry also failed:', retryError.message);
        console.log('Falling back to mock data...');
        // Fall through to use mock data
        throw new Error('Plant.ID API failed after multiple attempts. Using fallback diagnosis.');
      }
    }
    
    // Enhanced error handling with specific messages
    if (error.response?.status === 401 || error.response?.data?.error?.includes('api key')) {
      throw new Error('Invalid or missing Plant.ID API key. Please check your API key configuration.');
    } else if (error.response?.status === 429) {
      throw new Error('Plant.ID API rate limit exceeded. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Plant.ID API request timeout. Please try again.');
    } else if (error.response?.status === 402) {
      throw new Error('Plant.ID API quota exceeded. Please check your subscription.');
    } else if (error.response?.status === 400) {
      console.error('Bad request details:', error.response.data);
      if (error.response.data?.error?.includes('Unknown modifier')) {
        throw new Error('Plant.ID API format incompatibility. Using fallback diagnosis method.');
      }
      throw new Error('Invalid request format. Please check the image data.');
    } else if (error.response?.status === 403) {
      throw new Error('Plant.ID API access forbidden. Please verify your API key permissions.');
    } else {
      throw new Error(`Plant.ID API error: ${error.response?.data?.error || error.message}`);
    }
  }
};

/**
 * Diagnose plant disease from image URL using Plant.ID Health Assessment API
 */
exports.diagnosePlantDiseaseByUrl = async (imageUrl, modifiers = []) => {
  try {
    if (!validateApiKey()) {
      throw new Error('Plant.ID API key not configured or invalid. Please check your .env file.');
    }

    console.log('🔍 Sending plant disease diagnosis request (URL) to Plant.ID Health Assessment API...');
    console.log('Using endpoint:', `${PLANT_ID_BASE_URL}/health_assessment`);
    console.log('Request structure: URL in images array');

    // FIXED: Use only valid parameters according to the error message
    const requestData = {
      images: [imageUrl],
      health: 'all',       // Valid parameter
      similar_images: true // Valid parameter
    };

    const response = await axios.post(`${PLANT_ID_BASE_URL}/health_assessment`, requestData, {
      headers: {
        'Api-Key': PLANT_ID_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ Plant disease diagnosis (URL) successful');
    return response.data;
  } catch (error) {
    console.error('❌ Plant.ID Health Assessment API Error (URL):', error.response?.data || error.message);
    
    // Try retry logic for URL requests too with minimal properties
    if (error.response?.status === 400) {
      console.log('🔄 Retrying URL request with minimal format...');
      
      try {
        const basicRequestData = {
          images: [imageUrl],
          health: 'all'  // Only include essential property
        };

        const retryResponse = await axios.post(`${PLANT_ID_BASE_URL}/health_assessment`, basicRequestData, {
          headers: {
            'Api-Key': PLANT_ID_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });

        console.log('✅ Plant disease diagnosis (URL retry) successful');
        return retryResponse.data;
      } catch (retryError) {
        console.error('❌ URL retry also failed:', retryError.response?.data || retryError.message);
      }
    }
    
    if (error.response?.status === 401 || error.response?.data?.error?.includes('api key')) {
      throw new Error('Invalid or missing Plant.ID API key. Please check your API key configuration.');
    } else if (error.response?.status === 429) {
      throw new Error('Plant.ID API rate limit exceeded. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Plant.ID API request timeout. Please try again.');
    } else if (error.response?.status === 402) {
      throw new Error('Plant.ID API quota exceeded. Please check your subscription.');
    } else if (error.response?.status === 400) {
      if (error.response.data?.error?.includes('Unknown modifier')) {
        throw new Error('Plant.ID API format incompatibility. Using fallback diagnosis method.');
      }
      throw new Error('Invalid image URL or request format.');
    } else if (error.response?.status === 403) {
      throw new Error('Plant.ID API access forbidden. Please verify your API key permissions.');
    } else {
      throw new Error(`Plant.ID API error: ${error.response?.data?.error || error.message}`);
    }
  }
};

/**
 * Extract and format disease diagnosis data from Plant.ID Health Assessment response
 * @param {Object} apiResponse - Raw API response from Plant.ID Health Assessment
 * @returns {Object} Formatted diagnosis data
 */
exports.extractDiagnosisData = (apiResponse) => {
  console.log('Extracting diagnosis data from API response...');
  
  if (!apiResponse || !apiResponse.result) {
    console.error('API response missing result object');
    return null;
  }

  const result = apiResponse.result;
  
  // Detailed logging of the entire result structure to diagnose missing health_assessment
  console.log('Result keys available:', Object.keys(result).join(', '));
  
  // NEW: First check if we have a disease key in the result - this is the new API format
  if (result.disease && !result.health_assessment) {
    console.log('Found disease key in result - using new API response format');
    
    // Extract disease data from the new format
    const diseaseData = result.disease;
    const isHealthy = result.is_healthy?.binary !== false;
    
    // Check if the image contains a plant
    const isPlant = result.is_plant?.binary || false;
    const plantProbability = result.is_plant?.probability || 0;
    
    console.log(`Is plant: ${isPlant}, Probability: ${plantProbability}`);
    
    if (!isPlant || plantProbability < 0.5) {
      console.log('Image does not appear to contain a plant');
      return {
        isHealthy: false,
        diseases: [],
        pests: [],
        overall_health: 'not_plant',
        error: 'The uploaded image does not appear to contain a plant. Please upload a clear image of a plant.',
        recommendations: {
          immediate_actions: ['Upload a clear image of a plant'],
          preventive_measures: [],
          monitoring: [],
          treatment_priority: 'low'
        }
      };
    }
    
    // Process diseases from the disease.suggestions array
    let diseases = [];
    if (diseaseData.suggestions && diseaseData.suggestions.length > 0) {
      console.log(`Processing ${diseaseData.suggestions.length} diseases from new API format`);
      
      diseases = diseaseData.suggestions.map(disease => {
        console.log(`Disease: ${disease.name}, Probability: ${disease.probability}`);
        
        // Create a standardized disease object that matches our expected format
        return {
          name: disease.name || "Unidentified Disease",
          common_names: disease.common_names || [],
          probability: disease.probability || 0.5,
          description: disease.description || "No description available",
          cause: disease.cause || "Unknown cause",
          treatment: {
            chemical: disease.treatment?.chemical?.join('; ') || 'Consult with a plant specialist',
            organic: disease.treatment?.biological?.join('; ') || 'Ensure proper growing conditions',
            cultural: disease.treatment?.prevention?.join('; ') || 'Monitor plant health regularly',
            prevention: disease.treatment?.prevention?.join('; ') || 'Practice good plant hygiene'
          },
          prevention: disease.treatment?.prevention?.join('; ') || "Regular monitoring",
          classification: disease.classification || [],
          severity: disease.probability > 0.7 ? 'high' : disease.probability > 0.4 ? 'medium' : 'low',
          entity_id: disease.id || `disease-${Math.random().toString(36).substring(2, 10)}`,
          similar_images: disease.similar_images || []
        };
      });
    } else {
      console.log('No disease suggestions found in new API format');
    }
    
    // If the API thinks the plant is unhealthy but no specific diseases were found
    if (!isHealthy && diseases.length === 0) {
      console.log('Plant appears unhealthy but no specific disease identified');
      diseases.push({
        name: "Unspecified Plant Health Issue",
        common_names: ["General plant stress"],
        probability: 0.6,
        description: "The plant appears to have health issues, but a specific disease couldn't be identified. This could be due to environmental stress, nutrient deficiencies, or early stages of disease.",
        cause: "Possible causes include environmental stress, improper care, or nutrient imbalance",
        treatment: {
          chemical: "Consider a general-purpose plant health supplement",
          organic: "Ensure proper watering, light, and soil conditions",
          cultural: "Review and adjust care routine as needed",
          prevention: "Regular monitoring and maintaining optimal growing conditions"
        },
        severity: "medium",
        entity_id: "unspecified-health-issue"
      });
    }
    
    // Determine overall health status
    const overallHealth = !isHealthy && diseases.some(d => d.severity === 'high') ? 'critical' : 
                          !isHealthy || diseases.length > 0 ? 'diseased' : 'healthy';
    
    // Create recommendations based on diseases
    const recommendations = generateHealthRecommendations(diseases, []);
    
    // Create the complete diagnosis data
    const diagnosisData = {
      isHealthy: isHealthy && diseases.length === 0,
      healthProbability: result.is_healthy?.probability || (diseases.length === 0 ? 0.9 : 0.3),
      diseases,
      pests: [], // New API format doesn't seem to include pests info
      overall_health: overallHealth,
      recommendations,
      plant_details: result.classification ? {
        suggestions: result.classification.suggestions?.slice(0, 3).map(suggestion => ({
          name: suggestion.name,
          probability: suggestion.probability,
          common_names: suggestion.details?.common_names || []
        })) || []
      } : null
    };
    
    console.log(`Final diagnosis (new format): ${diagnosisData.overall_health}, Diseases: ${diagnosisData.diseases.length}`);
    return diagnosisData;
  }
  
  // Original code for health_assessment format
  // Check for direct health data in the response - some API versions include it differently
  const healthAssessment = result.health_assessment || result.health_result || result.health;
  
  console.log('Health assessment present:', !!healthAssessment);
  
  // Check if the image contains a plant
  const isPlant = result.is_plant?.binary || false;
  const plantProbability = result.is_plant?.probability || 0;
  
  console.log(`Is plant: ${isPlant}, Probability: ${plantProbability}`);
  
  // If health assessment is missing but the plant looks unhealthy, create a synthetic assessment
  // This is our fallback mechanism when health data is missing
  if (!healthAssessment && result.classification && result.classification.suggestions) {
    console.log('No health assessment data but plant identification succeeded - checking for known disease plants');
    
    // Check if any of the suggested plants are known to be diseased varieties
    const suggestions = result.classification.suggestions;
    const possibleDisease = suggestions.some(s => 
      (s.name && s.name.toLowerCase().includes('disease')) || 
      (s.name && s.name.toLowerCase().includes('blight')) ||
      (s.details?.common_names?.some(name => 
        name.toLowerCase().includes('disease') || 
        name.toLowerCase().includes('infected') ||
        name.toLowerCase().includes('blight') ||
        name.toLowerCase().includes('spot')
      ))
    );
    
    if (possibleDisease) {
      console.log('Potential disease identified from plant classification!');
      
      // Create synthetic health assessment
      const syntheticDiseases = [{
        name: "Potential Plant Disease",
        probability: 0.65,
        common_names: ["Detected Leaf Condition"],
        description: "The system detected potential disease markers in the plant image, but couldn't specify the exact disease. The plant appears to show signs of stress or disease symptoms.",
        cause: "Could be fungal, bacterial, viral or environmental stress",
        treatment: {
          chemical: ["Consider a broad-spectrum fungicide if symptoms worsen"],
          biological: ["Isolate the plant and ensure proper growing conditions"],
          prevention: ["Improve air circulation, avoid overhead watering"]
        },
        classification: ["Unspecified Disease"],
        entity_id: "potential-disease-001",
        severity: "medium"
      }];
      
      return {
        isHealthy: false,
        healthProbability: 0.35,
        diseases: syntheticDiseases,
        pests: [],
        overall_health: 'diseased',
        recommendations: generateHealthRecommendations(syntheticDiseases, []),
        plant_details: result.classification ? {
          suggestions: result.classification.suggestions?.slice(0, 3).map(suggestion => ({
            name: suggestion.name,
            probability: suggestion.probability,
            common_names: suggestion.details?.common_names || []
          })) || []
        } : null
      };
    }
  }
  
  // If there's no health assessment but it is a plant, we need to decide if it's really healthy
  if (!healthAssessment) {
    // Check for visual indicators of disease even if the API didn't explicitly classify it
    if (isPlant && plantProbability > 0.8) {
      console.log('Creating fallback disease detection mechanism since health_assessment is missing');
      
      // Create a generic disease assessment with recommendations to manually check the plant
      return {
        isHealthy: false, // Change default assumption to unhealthy when assessment is missing
        healthProbability: 0.5,
        diseases: [{
          name: "Unspecified Plant Condition",
          common_names: ["Plant health concern"],
          probability: 0.7,
          description: "The automated disease detection didn't identify specific issues, but many plant diseases require expert examination. If your plant shows visible symptoms, please check it carefully.",
          cause: "Could be early-stage disease, nutrient deficiency, or environmental stress",
          treatment: {
            chemical: "Consult a plant specialist for proper diagnosis before applying treatments",
            organic: "Ensure proper growing conditions (light, water, soil, humidity)",
            cultural: "Monitor for progression of symptoms and isolate from other plants if concerned",
            prevention: "Regular inspection and maintenance of optimal growing environment"
          },
          severity: "medium",
          entity_id: "manual-inspection-recommended"
        }],
        pests: [],
        overall_health: 'diseased', // Changed from 'needs_attention' to 'diseased'
        recommendations: {
          immediate_actions: [
            "Carefully examine leaves, stems and soil for visible disease symptoms",
            "Take clear, close-up photos of any concerning areas for better diagnosis",
            "Consider consulting a plant specialist if symptoms are severe"
          ],
          preventive_measures: [
            "Ensure proper light exposure for your specific plant type",
            "Follow appropriate watering schedule, avoiding over/under watering",
            "Monitor humidity and temperature conditions",
            "Consider testing soil pH and nutrient levels"
          ],
          monitoring: [
            "Check plant regularly for changes in appearance",
            "Document any progression of symptoms with photos",
            "Compare against healthy specimens of the same plant type"
          ],
          treatment_priority: "medium"
        }
      };
    }
    
    // Default to healthy if we have no health data and no evidence of disease
    console.log('No health assessment found, assuming healthy plant as fallback');
    return {
      isHealthy: true,
      healthProbability: 0.85,
      diseases: [],
      pests: [],
      overall_health: 'healthy',
      recommendations: generateHealthRecommendations([], [])
    };
  }

  // Continue with normal processing if we have health assessment data
  // Process diseases from health assessment
  let diseases = [];
  if (healthAssessment.diseases && healthAssessment.diseases.length > 0) {
    console.log(`Processing ${healthAssessment.diseases.length} diseases`);
    diseases = healthAssessment.diseases.map(disease => {
      console.log(`Disease: ${disease.name}, Probability: ${disease.probability}`);
      return {
        name: disease.name,
        common_names: disease.common_names || [],
        probability: disease.probability,
        description: disease.description || '',
        cause: disease.cause || '',
        treatment: {
          chemical: disease.treatment?.chemical?.join('; ') || '',
          organic: disease.treatment?.biological?.join('; ') || '',
          cultural: disease.treatment?.prevention?.join('; ') || '',
          prevention: disease.treatment?.prevention?.join('; ') || ''
        },
        prevention: disease.treatment?.prevention?.join('; ') || '',
        classification: disease.classification || [],
        severity: disease.probability > 0.7 ? 'high' : disease.probability > 0.4 ? 'medium' : 'low',
        entity_id: disease.entity_id,
        similar_images: disease.similar_images || []
      };
    });
  } else {
    console.log('No diseases found in health assessment');
  }
  
  // If API reports plant is unhealthy but doesn't identify specific diseases,
  // add a generic disease issue
  const isHealthy = healthAssessment.is_healthy?.binary !== false;
  if (!isHealthy && diseases.length === 0) {
    console.log('Plant appears unhealthy but no specific disease identified');
    diseases.push({
      name: "Unspecified Plant Health Issue",
      common_names: ["General plant stress"],
      probability: 0.6,
      description: "The plant appears to have health issues, but a specific disease couldn't be identified. This could be due to environmental stress, nutrient deficiencies, or early stages of disease.",
      cause: "Possible causes include environmental stress, improper care, or nutrient imbalance",
      treatment: {
        chemical: "Consider a general-purpose plant health supplement",
        organic: "Ensure proper watering, light, and soil conditions",
        cultural: "Review and adjust care routine as needed",
        prevention: "Regular monitoring and maintaining optimal growing conditions"
      },
      severity: "medium",
      entity_id: "unspecified-health-issue"
    });
  }
  
  // Process pests if available
  const pests = healthAssessment.pests?.map(pest => ({
    name: pest.name,
    common_names: pest.common_names || [],
    probability: pest.probability,
    description: pest.description || '',
    treatment: {
      chemical: pest.treatment?.chemical?.join('; ') || '',
      organic: pest.treatment?.biological?.join('; ') || '',
      cultural: pest.treatment?.prevention?.join('; ') || '',
      prevention: pest.treatment?.prevention?.join('; ') || ''
    },
    prevention: pest.treatment?.prevention?.join('; ') || '',
    severity: pest.probability > 0.7 ? 'high' : pest.probability > 0.4 ? 'medium' : 'low'
  })) || [];

  const healthProbability = healthAssessment.is_healthy?.probability || (diseases.length === 0 ? 1 : 0.3);

  const result_data = {
    isHealthy: isHealthy,
    healthProbability,
    diseases,
    pests: healthAssessment.pests?.map(pest => ({
      name: pest.name,
      common_names: pest.common_names || [],
      probability: pest.probability,
      description: pest.description || '',
      treatment: {
        chemical: pest.treatment?.chemical?.join('; ') || '',
        organic: pest.treatment?.biological?.join('; ') || '',
        cultural: pest.treatment?.prevention?.join('; ') || '',
        prevention: pest.treatment?.prevention?.join('; ') || ''
      },
      prevention: pest.treatment?.prevention?.join('; ') || '',
      severity: pest.probability > 0.7 ? 'high' : pest.probability > 0.4 ? 'medium' : 'low'
    })) || [],
    overall_health: !isHealthy && diseases.some(d => d.severity === 'high') ? 'critical' : 
                   !isHealthy ? 'diseased' : 'healthy',
    recommendations: generateHealthRecommendations(diseases, healthAssessment.pests || []),
    plant_details: result.classification ? {
      suggestions: result.classification.suggestions?.slice(0, 3).map(suggestion => ({
        name: suggestion.name,
        probability: suggestion.probability,
        common_names: suggestion.details?.common_names || []
      })) || []
    } : null
  };
  
  console.log(`Final diagnosis: ${result_data.overall_health}, Diseases: ${result_data.diseases.length}`);
  return result_data;
};

/**
 * Generate health recommendations based on diagnosis
 * @param {Array} diseases - Detected diseases
 * @param {Array} pests - Detected pests
 * @returns {Object} Health recommendations
 */
const generateHealthRecommendations = (diseases, pests) => {
  const recommendations = {
    immediate_actions: [],
    preventive_measures: [],
    monitoring: [],
    treatment_priority: 'low'
  };

  // Analyze diseases
  if (diseases.length > 0) {
    const highSeverityDiseases = diseases.filter(d => d.severity === 'high');
    const mediumSeverityDiseases = diseases.filter(d => d.severity === 'medium');
    
    if (highSeverityDiseases.length > 0) {
      recommendations.treatment_priority = 'high';
      recommendations.immediate_actions.push('Isolate plant immediately to prevent spread');
      recommendations.immediate_actions.push('Remove severely affected plant parts');
      recommendations.immediate_actions.push('Apply appropriate treatment as soon as possible');
    } else if (mediumSeverityDiseases.length > 0) {
      recommendations.treatment_priority = 'medium';
      recommendations.immediate_actions.push('Monitor plant closely for progression');
      recommendations.immediate_actions.push('Consider treatment options');
    }

    // Add specific treatment recommendations
    diseases.forEach(disease => {
      if (disease.treatment) {
        if (disease.treatment.organic) {
          recommendations.immediate_actions.push(`Organic treatment: ${disease.treatment.organic}`);
        }
        if (disease.treatment.chemical) {
          recommendations.immediate_actions.push(`Chemical treatment: ${disease.treatment.chemical}`);
        }
        if (disease.treatment.cultural) {
          recommendations.preventive_measures.push(`Cultural control: ${disease.treatment.cultural}`);
        }
      }
    });
  }

  // Analyze pests
  if (pests.length > 0) {
    recommendations.immediate_actions.push('Inspect plant thoroughly for pest presence');
    recommendations.preventive_measures.push('Maintain good plant hygiene');
    
    if (recommendations.treatment_priority === 'low') {
      recommendations.treatment_priority = 'medium';
    }
  }

  // General recommendations if no specific issues found
  if (diseases.length === 0 && pests.length === 0) {
    recommendations.preventive_measures.push('Continue current care routine');
    recommendations.preventive_measures.push('Monitor for any changes in plant health');
    recommendations.preventive_measures.push('Ensure proper watering and light conditions');
  } else {
    // General disease/pest prevention
    recommendations.preventive_measures.push('Ensure proper air circulation around plant');
    recommendations.preventive_measures.push('Avoid overhead watering when possible');
    recommendations.preventive_measures.push('Remove dead or dying plant material promptly');
    recommendations.preventive_measures.push('Quarantine new plants before introducing to collection');
  }
  
  recommendations.monitoring.push('Check plant weekly for new symptoms');
  recommendations.monitoring.push('Monitor environmental conditions (humidity, temperature)');
  recommendations.monitoring.push('Track treatment effectiveness if applied');

  // Remove duplicates and empty entries
  recommendations.immediate_actions = [...new Set(recommendations.immediate_actions)].filter(Boolean);
  recommendations.preventive_measures = [...new Set(recommendations.preventive_measures)].filter(Boolean);
  recommendations.monitoring = [...new Set(recommendations.monitoring)].filter(Boolean);

  return recommendations;
};

/**
 * Mock diagnosis function for when API is not available
 * @returns {Object} Mock diagnosis data
 */
exports.mockDiagnosis = () => {
  console.log('🔧 Using mock plant disease diagnosis (API not available)');
  
  return {
    result: {
      is_plant: { probability: 0.95, binary: true },
      health_assessment: {
        is_healthy: { probability: 0.3, binary: false },
        diseases: [
          {
            name: "Demo: Leaf spot disease",
            probability: 0.75,
            common_names: ["Demo Brown spot", "Demo Leaf blight"],
            description: "This is demonstration data. To get real plant disease diagnosis, please:\n\n1. Sign up at https://web.plant.id/\n2. Get your API key from the dashboard\n3. Add PLANT_ID_API_KEY=your_key to your .env file\n4. Restart the server",
            cause: "Demo: Fungal infection (real diagnosis requires valid API key)",
            treatment: {
              chemical: ["Demo: Apply copper-based fungicide (configure API for real recommendations)"],
              biological: ["Demo: Apply beneficial bacteria (configure API for real recommendations)"],
              prevention: ["Configure Plant.ID API key for real treatment recommendations"]
            },
            classification: ["Demo", "Configuration Required"],
            entity_id: "demo-disease-001",
            similar_images: []
          }
        ]
      },
      classification: {
        suggestions: [
          {
            name: "Demo Plant Species",
            probability: 0.85,
            details: {
              common_names: ["Demo Plant", "Configure API for real identification"]
            }
          }
        ]
      }
    }
  };
};

// Export validation function for use in controller
exports.validateApiKey = validateApiKey;

// Ensure all functions are properly exported
console.log('Plant Disease Service exports:', {
  diagnosePlantDiseaseByBase64: typeof exports.diagnosePlantDiseaseByBase64,
  diagnosePlantDiseaseByUrl: typeof exports.diagnosePlantDiseaseByUrl,
  extractDiagnosisData: typeof exports.extractDiagnosisData,
  mockDiagnosis: typeof exports.mockDiagnosis
});
