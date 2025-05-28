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

    // Verify plant exists and belongs to user (only if plantId is provided)
    if (plantId) {
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
          error: 'Not authorized to diagnose this plant'
        });
      }
    }

    console.log('🔍 Starting plant disease diagnosis...');

    // Check if disease service is available
    if (!plantDiseaseService) {
      console.log('🔧 Plant disease service not available, using mock diagnosis');
      
      // Create mock diagnosis data directly
      const mockDiagnosisData = {
        isHealthy: false,
        healthProbability: 0.3,
        diseases: [
          {
            name: "Mock Leaf Spot Disease",
            common_names: ["Brown spot", "Leaf blight"],
            probability: 0.75,
            description: "This is demonstration data. Plant disease diagnosis service is not configured.",
            cause: "Service configuration required",
            treatment: {
              chemical: "Configure Plant.ID API key for real diagnosis",
              organic: "Add PLANT_ID_API_KEY to environment variables",
              cultural: "Contact administrator to enable diagnosis features"
            },
            prevention: "Proper service configuration needed",
            classification: ["Demo", "Configuration Required"],
            severity: "medium",
            entity_id: "mock-disease-001"
          }
        ],
        pests: [],
        overall_health: 'diseased',
        recommendations: {
          immediate_actions: ["Configure Plant.ID API key", "Contact system administrator"],
          preventive_measures: ["Ensure proper service configuration"],
          monitoring: ["Check service status regularly"],
          treatment_priority: "medium"
        }
      };

      // Save mock diagnosis to database
      const diagnosis = new PlantDiagnosis({
        plant: plantId || undefined, // Use undefined instead of null
        user: req.user.id,
        diagnosisImage: imageUrl || `data:image/jpeg;base64,${base64Image ? base64Image.substring(0, 50) + '...' : 'no-image'}`,
        isHealthy: mockDiagnosisData.isHealthy,
        healthProbability: mockDiagnosisData.healthProbability,
        diseases: mockDiagnosisData.diseases,
        pests: mockDiagnosisData.pests,
        overallHealth: mockDiagnosisData.overall_health,
        recommendations: mockDiagnosisData.recommendations,
        notes: notes || 'Mock diagnosis - service not configured',
        followUpRequired: false
      });

      await diagnosis.save();

      return res.status(200).json({
        success: true,
        data: {
          diagnosis: diagnosis,
          summary: {
            isHealthy: false,
            diseaseCount: 1,
            pestCount: 0,
            overallHealth: 'diseased',
            treatmentPriority: 'medium',
            followUpRequired: false
          },
          serviceInfo: {
            usingMockData: true,
            apiAvailable: false,
            message: "Plant disease diagnosis service is not configured. This is demonstration data."
          }
        }
      });
    }

    let diagnosisResults;

    // Check if API key is configured, otherwise use mock data
    if (!process.env.PLANT_ID_API_KEY) {
      console.log('🔧 No API key configured, using mock diagnosis');
      diagnosisResults = plantDiseaseService.mockDiagnosis();
    } else {
      try {
        if (imageUrl) {
          diagnosisResults = await plantDiseaseService.diagnosePlantDiseaseByUrl(imageUrl);
        } else if (base64Image) {
          diagnosisResults = await plantDiseaseService.diagnosePlantDiseaseByBase64(base64Image);
        }
        
        console.log('✅ Disease diagnosis completed successfully');
      } catch (apiError) {
        console.error('❌ Plant.ID Disease API failed:', apiError.message);
        
        // Fall back to mock diagnosis if API fails
        console.log('🔧 Falling back to mock diagnosis due to API error');
        diagnosisResults = plantDiseaseService.mockDiagnosis();
      }
    }

    // Extract structured diagnosis data
    const diagnosisData = plantDiseaseService.extractDiagnosisData(diagnosisResults);
    
    if (!diagnosisData) {
      return res.status(400).json({
        success: false,
        error: 'Could not process diagnosis results'
      });
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
    if (!plantId && diagnosisData.plant_details && diagnosisData.plant_details.suggestions.length > 0) {
      const topSuggestion = diagnosisData.plant_details.suggestions[0];
      identifiedPlant = {
        scientificName: topSuggestion.name,
        commonNames: topSuggestion.common_names,
        confidence: topSuggestion.probability,
        description: `Identified as ${topSuggestion.name} with ${Math.round(topSuggestion.probability * 100)}% confidence`
      };
    }

    // Save diagnosis to database - fix the plant field handling
    const diagnosisDoc = {
      user: req.user.id,
      diagnosisImage: imageUrl || `data:image/jpeg;base64,${base64Image ? base64Image.substring(0, 50) + '...' : 'no-image'}`,
      isHealthy: diagnosisData.isHealthy,
      healthProbability: diagnosisData.healthProbability,
      diseases: diagnosisData.diseases,
      pests: diagnosisData.pests,
      overallHealth: diagnosisData.overall_health,
      recommendations: diagnosisData.recommendations,
      notes: notes || '',
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

    // Update plant health status if plant is specified
    if (plantId && !diagnosisData.isHealthy) {
      await Plant.findByIdAndUpdate(plantId, {
        status: diagnosisData.overall_health === 'critical' ? 'Critical' : 'Needs Attention'
      });
    }

    console.log('💾 Diagnosis saved to database');

    // Return comprehensive response with service status
    res.status(200).json({
      success: true,
      data: {
        diagnosis: diagnosis,
        raw_results: diagnosisResults,
        summary: {
          isHealthy: diagnosisData.isHealthy,
          diseaseCount: diagnosisData.diseases.length,
          pestCount: diagnosisData.pests.length,
          overallHealth: diagnosisData.overall_health,
          treatmentPriority: diagnosisData.recommendations.treatment_priority,
          followUpRequired: diagnosis.followUpRequired
        },
        serviceInfo: {
          usingMockData: !process.env.PLANT_ID_API_KEY,
          apiAvailable: !!process.env.PLANT_ID_API_KEY
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
