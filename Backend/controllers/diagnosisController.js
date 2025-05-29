const PlantDiagnosis = require('../models/PlantDiagnosis');
const Plant = require('../models/Plant');

// Import plant disease service with better error handling
let plantDiseaseService;
try {
  plantDiseaseService = require('../services/plantDiseaseService');
  console.log('✅ Plant disease service loaded successfully');
} catch (error) {
  console.warn('⚠️  Plant disease service not found:', error.message);
  plantDiseaseService = null;
}

// @desc    Diagnose plant disease from image
// @route   POST /api/diagnosis/diagnose
// @access  Private
exports.diagnosePlantDisease = async (req, res) => {
  try {
    const { plantId, imageUrl, base64Image, notes } = req.body;
    
    if (!imageUrl && !base64Image) {
      return res.status(400).json({
        success: false,
        error: 'Please provide either an image URL or base64 image for diagnosis'
      });
    }

    // Check for base64 image size to prevent excessive requests
    if (base64Image && base64Image.length > 5000000) { // ~5MB limit
      return res.status(400).json({
        success: false,
        error: 'Image is too large. Please use an image smaller than 5MB.'
      });
    }

    console.log('🔍 Starting plant disease diagnosis...');
    console.log('Base64 image received, length:', base64Image ? base64Image.length : 'N/A');
    console.log('Image URL provided:', !!imageUrl);
    console.log('Plant ID API Key available:', !!process.env.PLANT_ID_API_KEY);
    console.log('Plant ID API URL:', process.env.PLANT_ID_API_URL);
    console.log('Disease service available:', !!plantDiseaseService);
    
    // Enhanced API key validation
    if (process.env.PLANT_ID_API_KEY) {
      const apiKey = process.env.PLANT_ID_API_KEY;
      if (apiKey === 'your_actual_api_key_here' || apiKey === 'your_plant_id_api_key_here') {
        console.log('❌ Plant.ID API key is set to placeholder value');
        usingMockData = true;
        apiError = 'Plant.ID API key is set to placeholder value. Please update with your actual API key.';
      } else if (apiKey.length < 20) {
        console.log('❌ Plant.ID API key appears to be invalid (too short)');
        usingMockData = true;
        apiError = 'Plant.ID API key appears to be invalid. Please check your API key.';
      } else {
        console.log('✅ Plant.ID API key appears to be properly configured');
      }
    }

    // Set a timeout handler for the API call
    let diagnosisResults;
    let usingMockData = false;
    let apiError = null;
    let apiCallTimeout = false;

    // Use a promise with timeout to handle potential API hanging
    try {
      // Set a timeout promise to race against the API call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          apiCallTimeout = true;
          reject(new Error('Plant.ID API request timed out after 45 seconds'));
        }, 45000); // 45 second timeout
      });
      
      // Attempt the API call with a timeout
      if (plantDiseaseService) {
        console.log('Making API call using plantDiseaseService...');
        
        if (imageUrl) {
          console.log('Using URL-based diagnosis method');
          diagnosisResults = await Promise.race([
            plantDiseaseService.diagnosePlantDiseaseByUrl(imageUrl),
            timeoutPromise
          ]);
          console.log('URL-based diagnosis completed');
        } else if (base64Image) {
          console.log('Using base64-based diagnosis method');
          
          // Add even more timeout safety
          setTimeout(() => {
            if (!diagnosisResults && !apiCallTimeout) {
              console.warn('⚠️ API call appears to be hanging but not yet timed out');
            }
          }, 20000); // Check after 20 seconds
          
          diagnosisResults = await Promise.race([
            plantDiseaseService.diagnosePlantDiseaseByBase64(base64Image),
            timeoutPromise
          ]);
          console.log('Base64-based diagnosis completed');
        }
        console.log('✅ Plant.ID API call completed successfully');
      } else {
        usingMockData = true;
        apiError = 'Plant disease service not available';
        diagnosisResults = null;
      }
    } catch (apiCallError) {
      console.error('❌ Plant.ID API error:', apiCallError.message);
      console.error('Error type:', apiCallError.name);
      console.error('Error code:', apiCallError.code);
      if (apiCallError.response) {
        console.error('Response status:', apiCallError.response.status);
        console.error('Response data:', JSON.stringify(apiCallError.response.data).substring(0, 200) + '...');
      }
      
      usingMockData = true;
      apiError = apiCallTimeout ? 
        'Plant.ID API request timed out. The service might be experiencing high traffic.' : 
        apiCallError.message;
      
      console.log('Falling back to mock diagnosis data');
      // Use mock data as fallback
      diagnosisResults = plantDiseaseService?.mockDiagnosis() || null;
    }

    // If we don't have real results yet, use mock data
    if (!diagnosisResults) {
      console.log('🔧 Using mock diagnosis data');
      usingMockData = true;
      if (plantDiseaseService && plantDiseaseService.mockDiagnosis) {
        diagnosisResults = plantDiseaseService.mockDiagnosis();
      } else {
        // Fallback mock data if service is completely unavailable
        diagnosisResults = {
          result: {
            is_plant: { probability: 0.95, binary: true },
            health_assessment: {
              is_healthy: { probability: 0.4, binary: false },
              diseases: [
                {
                  name: "Demo Disease Detection",
                  probability: 0.70,
                  common_names: ["Demo Disease", "Test Condition"],
                  description: "This is demonstration data. Real plant disease diagnosis requires proper API configuration.",
                  cause: "API service not properly configured",
                  treatment: {
                    chemical: ["Configure Plant.ID API key for real diagnosis"],
                    biological: ["Contact administrator to enable disease detection"],
                    prevention: ["Ensure proper service setup"]
                  },
                  classification: ["Demo", "Configuration"],
                  entity_id: "demo-disease-001"
                }
              ]
            }
          }
        };
      }
    }

    // Extract structured diagnosis data
    const diagnosisData = plantDiseaseService ? 
      plantDiseaseService.extractDiagnosisData(diagnosisResults) :
      {
        isHealthy: false,
        healthProbability: 0.4,
        diseases: [{
          name: "Service Configuration Required",
          common_names: ["Demo Disease"],
          probability: 0.70,
          description: "Plant disease diagnosis service requires proper configuration.",
          cause: "Service not available",
          treatment: {
            chemical: "Configure Plant.ID API key",
            organic: "Contact administrator",
            cultural: "Enable diagnosis service"
          },
          prevention: "Proper service configuration",
          classification: ["Configuration"],
          severity: "medium",
          entity_id: "config-required-001"
        }],
        pests: [],
        overall_health: 'diseased',
        recommendations: {
          immediate_actions: ["Configure diagnosis service", "Contact administrator"],
          preventive_measures: ["Ensure proper API key setup"],
          monitoring: ["Check service configuration"],
          treatment_priority: "medium"
        }
      };
    
    // Add this after extracting diagnosis data
    console.log(`Diagnosis summary: Health status=${diagnosisData.isHealthy ? 'Healthy' : 'Unhealthy'}, Diseases=${diagnosisData.diseases.length}`);

    // If the user specified that the plant has disease but we didn't detect any,
    // add a special note about possible missed detection
    if (diagnosisData.isHealthy && diagnosisData.diseases.length === 0 && notes && 
        (notes.toLowerCase().includes('disease') || 
         notes.toLowerCase().includes('sick') || 
         notes.toLowerCase().includes('unhealthy') ||
         notes.toLowerCase().includes('spots') ||
         notes.toLowerCase().includes('yellowing'))) {
      
      console.log('User indicated plant has disease but none was detected - adding special note');
      
      // Add a disease with low confidence
      diagnosisData.isHealthy = false;
      diagnosisData.diseases.push({
        name: "User-Reported Plant Condition",
        common_names: ["Reported Symptoms"],
        probability: 0.51,
        description: "You indicated this plant may have issues, but our automated detection couldn't confirm specific diseases. Some conditions require expert examination.",
        cause: "Could be early-stage disease, nutrient issues, or environmental stress",
        treatment: {
          chemical: "Consult a plant specialist before applying chemical treatments",
          organic: "Ensure proper growing conditions for your specific plant type",
          cultural: "Monitor changes and document with photos for better diagnosis",
          prevention: "Regular inspection and maintenance of optimal growing environment"
        },
        severity: "medium",
        entity_id: "user-reported-condition"
      });
      
      diagnosisData.overall_health = 'diseased'; // Changed from 'needs_attention' to 'diseased'
      diagnosisData.recommendations.immediate_actions.push("Take close-up photos of concerning areas for better diagnosis");
      diagnosisData.recommendations.treatment_priority = 'medium';
    }

    // Handle non-plant images
    if (diagnosisData.overall_health === 'not_plant') {
      return res.status(400).json({
        success: false,
        error: diagnosisData.error || 'The uploaded image does not appear to contain a plant'
      });
    }

    // Extract plant identification info for standalone diagnoses
    let identifiedPlant = null;
    if (!plantId && diagnosisResults.result?.classification?.suggestions?.length > 0) {
      const topSuggestion = diagnosisResults.result.classification.suggestions[0];
      identifiedPlant = {
        scientificName: topSuggestion.name,
        commonNames: topSuggestion.details?.common_names || [],
        confidence: topSuggestion.probability,
        description: `Identified as ${topSuggestion.name} with ${Math.round(topSuggestion.probability * 100)}% confidence`
      };
    }

    // Save diagnosis to database
    const diagnosisDoc = {
      user: req.user.id,
      diagnosisImage: imageUrl || `data:image/jpeg;base64,${base64Image ? base64Image.substring(0, 50) + '...' : 'no-image'}`,
      isHealthy: diagnosisData.isHealthy,
      healthProbability: diagnosisData.healthProbability,
      diseases: diagnosisData.diseases,
      pests: diagnosisData.pests,
      overallHealth: diagnosisData.overall_health,
      recommendations: diagnosisData.recommendations,
      notes: notes || (usingMockData ? 'Using demo data - real diagnosis requires API configuration' : ''),
      followUpRequired: diagnosisData.diseases.some(d => d.severity === 'high') || 
                        diagnosisData.pests.some(p => p.severity === 'high')
    };

    // Only add plant field if plantId is provided
    if (plantId) {
      diagnosisDoc.plant = plantId;
    }

    // Add identified plant info for standalone diagnoses
    if (identifiedPlant) {
      diagnosisDoc.identifiedPlant = identifiedPlant;
    }

    const diagnosis = new PlantDiagnosis(diagnosisDoc);

    // Set follow-up date if needed
    if (diagnosis.followUpRequired) {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 7); // Follow up in 1 week
      diagnosis.followUpDate = followUpDate;
    }

    await diagnosis.save();

    // Update plant health status if plant is specified and we have real diagnosis
    if (plantId && !diagnosisData.isHealthy) {
      try {
        // Determine appropriate health status based on diagnosis severity
        const newStatus = diagnosisData.recommendations.treatment_priority === 'high' 
          ? 'Critical' 
          : 'Needs Attention';
        
        console.log(`Updating plant ${plantId} health status to ${newStatus} based on diagnosis`);
        
        await Plant.findByIdAndUpdate(plantId, {
          status: newStatus
        });
        
        console.log('Plant health status updated successfully');
      } catch (statusUpdateError) {
        console.error('Error updating plant health status after diagnosis:', statusUpdateError);
      }
    } else if (plantId && diagnosisData.isHealthy) {
      // If the plant is healthy, make sure status reflects that
      try {
        console.log(`Setting plant ${plantId} health status to Healthy based on diagnosis`);
        
        await Plant.findByIdAndUpdate(plantId, {
          status: 'Healthy'
        });
        
        console.log('Plant health status updated to Healthy');
      } catch (statusUpdateError) {
        console.error('Error updating plant health status to Healthy:', statusUpdateError);
      }
    }

    console.log('💾 Diagnosis saved to database');

    // Return comprehensive response with service status
    res.status(200).json({
      success: true,
      data: {
        diagnosis: diagnosis,
        summary: {
          isHealthy: diagnosisData.isHealthy,
          diseaseCount: diagnosisData.diseases.length,
          pestCount: diagnosisData.pests.length,
          overallHealth: diagnosisData.overall_health,
          treatmentPriority: diagnosisData.recommendations.treatment_priority,
          followUpRequired: diagnosis.followUpRequired
        },
        serviceInfo: {
          usingMockData: usingMockData,
          apiAvailable: !!process.env.PLANT_ID_API_KEY && !!plantDiseaseService && 
                       (!plantDiseaseService.validateApiKey || plantDiseaseService.validateApiKey()),
          error: apiError,
          message: usingMockData ? 
            (apiError ? `Using demo data: ${apiError}` : "Using demonstration data") : 
            "Real diagnosis completed successfully",
          setupInstructions: usingMockData ? 
            "To enable real plant disease diagnosis: 1) Sign up at https://web.plant.id/ 2) Get your API key 3) Add PLANT_ID_API_KEY=your_key to .env file 4) Restart server" : 
            null
        }
      }
    });

  } catch (error) {
    console.error('❌ Diagnosis error:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: 'Disease diagnosis service encountered an error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get diagnosis history for a plant
// @route   GET /api/diagnosis/plant/:plantId
// @access  Private
exports.getPlantDiagnosisHistory = async (req, res) => {
  try {
    const { plantId } = req.params;
    
    // Verify plant exists and belongs to user
    const plant = await Plant.findById(plantId);
    if (!plant) {
      return res.status(404).json({
        success: false,
        error: 'Plant not found'
      });
    }
    
    if (plant.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this plant\'s diagnosis history'
      });
    }

    const diagnoses = await PlantDiagnosis.find({ plant: plantId })
      .sort({ diagnosisDate: -1 })
      .populate('plant', 'name nickname species mainImage');

    res.status(200).json({
      success: true,
      count: diagnoses.length,
      data: diagnoses
    });

  } catch (error) {
    console.error('Error fetching diagnosis history:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get all diagnosis history for user
// @route   GET /api/diagnosis/history
// @access  Private
exports.getUserDiagnosisHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    
    let filter = { user: req.user.id };
    
    // Apply status filter
    if (status === 'healthy') {
      filter.isHealthy = true;
    } else if (status === 'diseased') {
      filter.isHealthy = false;
    } else if (status === 'unresolved') {
      filter.resolved = false;
      filter.isHealthy = false;
    }

    const diagnoses = await PlantDiagnosis.find(filter)
      .sort({ diagnosisDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('plant', 'name nickname species mainImage')
      .exec();

    const total = await PlantDiagnosis.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: diagnoses.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: diagnoses
    });

  } catch (error) {
    console.error('Error fetching user diagnosis history:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single diagnosis
// @route   GET /api/diagnosis/:id
// @access  Private
exports.getDiagnosis = async (req, res) => {
  try {
    const diagnosis = await PlantDiagnosis.findById(req.params.id)
      .populate('plant', 'name nickname species mainImage user');
    
    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        error: 'Diagnosis not found'
      });
    }
    
    // Check if user owns this diagnosis
    if (diagnosis.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this diagnosis'
      });
    }
    
    res.status(200).json({
      success: true,
      data: diagnosis
    });

  } catch (error) {
    console.error('Error fetching diagnosis:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Diagnosis not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update diagnosis (add notes, mark as resolved)
// @route   PUT /api/diagnosis/:id
// @access  Private
exports.updateDiagnosis = async (req, res) => {
  try {
    const { notes, resolved, followUpDate } = req.body;
    
    let diagnosis = await PlantDiagnosis.findById(req.params.id);
    
    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        error: 'Diagnosis not found'
      });
    }
    
    // Check if user owns this diagnosis
    if (diagnosis.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this diagnosis'
      });
    }
    
    // Update fields
    if (notes !== undefined) diagnosis.notes = notes;
    if (resolved !== undefined) {
      diagnosis.resolved = resolved;
      if (resolved) {
        diagnosis.resolvedDate = new Date();
      }
    }
    if (followUpDate !== undefined) diagnosis.followUpDate = followUpDate;
    
    await diagnosis.save();
    
    res.status(200).json({
      success: true,
      data: diagnosis
    });

  } catch (error) {
    console.error('Error updating diagnosis:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete diagnosis
// @route   DELETE /api/diagnosis/:id
// @access  Private
exports.deleteDiagnosis = async (req, res) => {
  try {
    const diagnosis = await PlantDiagnosis.findById(req.params.id);
    
    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        error: 'Diagnosis not found'
      });
    }
    
    // Check if user owns this diagnosis
    if (diagnosis.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this diagnosis'
      });
    }
    
    await diagnosis.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });

  } catch (error) {
    console.error('Error deleting diagnosis:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get diagnosis statistics for user
// @route   GET /api/diagnosis/stats
// @access  Private
exports.getDiagnosisStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await PlantDiagnosis.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalDiagnoses: { $sum: 1 },
          healthyPlants: {
            $sum: { $cond: [{ $eq: ['$isHealthy', true] }, 1, 0] }
          },
          diseasedPlants: {
            $sum: { $cond: [{ $eq: ['$isHealthy', false] }, 1, 0] }
          },
          unresolvedIssues: {
            $sum: { $cond: [{ $and: [{ $eq: ['$isHealthy', false] }, { $eq: ['$resolved', false] }] }, 1, 0] }
          },
          highPriorityIssues: {
            $sum: { $cond: [{ $eq: ['$recommendations.treatment_priority', 'high'] }, 1, 0] }
          }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalDiagnoses: 0,
      healthyPlants: 0,
      diseasedPlants: 0,
      unresolvedIssues: 0,
      highPriorityIssues: 0
    };
    
    // Get recent diagnoses requiring follow-up
    const followUpDue = await PlantDiagnosis.find({
      user: userId,
      followUpRequired: true,
      resolved: false,
      followUpDate: { $lte: new Date() }
    }).populate('plant', 'name nickname');
    
    res.status(200).json({
      success: true,
      data: {
        ...result,
        followUpDue: followUpDue.length,
        recentFollowUps: followUpDue.slice(0, 5)
      }
    });

  } catch (error) {
    console.error('Error fetching diagnosis stats:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
