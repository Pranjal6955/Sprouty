const axios = require('axios');

const PLANT_ID_API_KEY = process.env.PLANT_ID_API_KEY;
const PLANT_ID_BASE_URL = 'https://plant.id/api/v3';

// Check if API key is available
if (!PLANT_ID_API_KEY) {
  console.warn('⚠️  Warning: PLANT_ID_API_KEY not found in environment variables');
  console.warn('   Plant disease diagnosis features will not work without a valid API key');
}

/**
 * Diagnose plant disease from base64 image using Plant.ID Health Assessment API
 * @param {string} base64Image - Base64 encoded image
 * @param {Array} modifiers - Additional modifiers for diagnosis
 * @returns {Object} Disease diagnosis results
 */
exports.diagnosePlantDiseaseByBase64 = async (base64Image, modifiers = []) => {
  try {
    if (!PLANT_ID_API_KEY) {
      throw new Error('Plant disease diagnosis service not configured - missing API key');
    }

    console.log('🔍 Sending plant disease diagnosis request to Plant.ID Health Assessment API...');

    // Default modifiers for health assessment
    const defaultModifiers = [
      'crops_fast',
      'similar_images',
      'disease_similar_images'
    ];

    const requestModifiers = [...defaultModifiers, ...modifiers];

    const requestData = {
      images: [`data:image/jpeg;base64,${base64Image}`],
      modifiers: requestModifiers,
      plant_language: 'en',
      plant_details: ['common_names', 'url', 'description', 'taxonomy'],
      disease_details: ['common_names', 'url', 'description', 'treatment', 'classification', 'cause']
    };

    console.log('Request data structure:', {
      imageCount: requestData.images.length,
      modifiers: requestData.modifiers,
      hasPlantDetails: !!requestData.plant_details,
      hasDiseaseDetails: !!requestData.disease_details
    });

    const response = await axios.post(`${PLANT_ID_BASE_URL}/health_assessment`, requestData, {
      headers: {
        'Api-Key': PLANT_ID_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    console.log('✅ Plant disease diagnosis successful');
    console.log('Response structure:', {
      hasResult: !!response.data.result,
      hasHealthAssessment: !!response.data.result?.health_assessment,
      hasDiseases: !!response.data.result?.health_assessment?.diseases,
      diseaseCount: response.data.result?.health_assessment?.diseases?.length || 0,
      isPlant: response.data.result?.is_plant?.binary || false,
      plantProbability: response.data.result?.is_plant?.probability || 0
    });

    return response.data;
  } catch (error) {
    console.error('❌ Plant.ID Health Assessment API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Invalid API key for plant disease diagnosis service');
    } else if (error.response?.status === 429) {
      throw new Error('Too many requests to plant disease diagnosis service');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Plant disease diagnosis service timeout');
    } else if (error.response?.status === 402) {
      throw new Error('Plant disease diagnosis service quota exceeded');
    } else if (error.response?.status === 400) {
      console.error('Bad request details:', error.response.data);
      throw new Error('Invalid request to plant disease diagnosis service - check image format and size');
    } else {
      throw new Error('Failed to diagnose plant disease using Plant.ID Health Assessment API');
    }
  }
};

/**
 * Diagnose plant disease from image URL using Plant.ID Health Assessment API
 * @param {string} imageUrl - URL of the image
 * @param {Array} modifiers - Additional modifiers for diagnosis
 * @returns {Object} Disease diagnosis results
 */
exports.diagnosePlantDiseaseByUrl = async (imageUrl, modifiers = []) => {
  try {
    if (!PLANT_ID_API_KEY) {
      throw new Error('Plant disease diagnosis service not configured - missing API key');
    }

    console.log('🔍 Sending plant disease diagnosis request (URL) to Plant.ID Health Assessment API...');

    const defaultModifiers = [
      'crops_fast',
      'similar_images',
      'disease_similar_images'
    ];

    const requestModifiers = [...defaultModifiers, ...modifiers];

    const requestData = {
      images: [imageUrl],
      modifiers: requestModifiers,
      plant_language: 'en',
      plant_details: ['common_names', 'url', 'description', 'taxonomy'],
      disease_details: ['common_names', 'url', 'description', 'treatment', 'classification', 'cause']
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
    
    if (error.response?.status === 401) {
      throw new Error('Invalid API key for plant disease diagnosis service');
    } else if (error.response?.status === 429) {
      throw new Error('Too many requests to plant disease diagnosis service');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Plant disease diagnosis service timeout');
    } else if (error.response?.status === 402) {
      throw new Error('Plant disease diagnosis service quota exceeded');
    } else if (error.response?.status === 400) {
      throw new Error('Invalid request to plant disease diagnosis service - check image URL');
    } else {
      throw new Error('Failed to diagnose plant disease using Plant.ID Health Assessment API');
    }
  }
};

/**
 * Extract and format disease diagnosis data from Plant.ID Health Assessment response
 * @param {Object} apiResponse - Raw API response from Plant.ID Health Assessment
 * @returns {Object} Formatted diagnosis data
 */
exports.extractDiagnosisData = (apiResponse) => {
  if (!apiResponse || !apiResponse.result) {
    return null;
  }

  const result = apiResponse.result;
  const healthAssessment = result.health_assessment;
  
  // Check if the image contains a plant
  const isPlant = result.is_plant?.binary || false;
  const plantProbability = result.is_plant?.probability || 0;
  
  if (!isPlant || plantProbability < 0.5) {
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
  
  if (!healthAssessment) {
    return {
      isHealthy: true,
      diseases: [],
      pests: [],
      overall_health: 'healthy',
      recommendations: generateHealthRecommendations([], [])
    };
  }

  // Process diseases from health assessment
  const diseases = healthAssessment.diseases?.map(disease => ({
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
  })) || [];

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

  const isHealthy = healthAssessment.is_healthy?.binary || diseases.length === 0;
  const healthProbability = healthAssessment.is_healthy?.probability || (diseases.length === 0 ? 1 : 0.3);

  return {
    isHealthy,
    healthProbability,
    diseases,
    pests,
    overall_health: !isHealthy && diseases.some(d => d.severity === 'high') ? 'critical' : 
                   !isHealthy ? 'diseased' : 'healthy',
    recommendations: generateHealthRecommendations(diseases, pests),
    plant_details: result.classification ? {
      suggestions: result.classification.suggestions?.slice(0, 3).map(suggestion => ({
        name: suggestion.name,
        probability: suggestion.probability,
        common_names: suggestion.details?.common_names || []
      })) || []
    } : null
  };
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
  console.log('🔧 Using mock plant disease diagnosis (no API key configured)');
  
  return {
    result: {
      is_plant: { probability: 0.95, binary: true },
      health_assessment: {
        is_healthy: { probability: 0.3, binary: false },
        diseases: [
          {
            name: "Leaf spot disease",
            probability: 0.75,
            common_names: ["Brown spot", "Leaf blight"],
            description: "This is demonstration data. Please configure your Plant.ID API key to get real disease identification results.",
            cause: "Fungal infection typically caused by high humidity and poor air circulation",
            treatment: {
              chemical: ["Apply copper-based fungicide", "Use systemic fungicide spray"],
              biological: ["Apply beneficial bacteria", "Use neem oil treatment"],
              prevention: ["Improve air circulation", "Reduce watering frequency", "Water at soil level"]
            },
            classification: ["Fungal", "Leaf disease", "Common"],
            entity_id: "mock-disease-001",
            similar_images: []
          }
        ]
      },
      classification: {
        suggestions: [
          {
            name: "Mock Plant Species",
            probability: 0.85,
            details: {
              common_names: ["Demo Plant", "Test Plant"]
            }
          }
        ]
      }
    }
  };
};

// Ensure all functions are properly exported
console.log('Plant Disease Service exports:', {
  diagnosePlantDiseaseByBase64: typeof exports.diagnosePlantDiseaseByBase64,
  diagnosePlantDiseaseByUrl: typeof exports.diagnosePlantDiseaseByUrl,
  extractDiagnosisData: typeof exports.extractDiagnosisData,
  mockDiagnosis: typeof exports.mockDiagnosis
});
