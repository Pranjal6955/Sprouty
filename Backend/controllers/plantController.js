const Plant = require('../models/Plant');
const axios = require('axios');

// Try to import plant identification service, with fallback
let plantIdentification;
try {
  plantIdentification = require('../services/plantIdentification');
  console.log('✅ Plant identification service loaded successfully');
} catch (error) {
  console.warn('⚠️  Plant identification service not found, features will be limited');
  plantIdentification = null;
}

// @desc    Create new plant
// @route   POST /api/plants
// @access  Private
exports.createPlant = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    
    // Handle image uploads
    const { mainImage, scientificDetails } = req.body;
    
    // Create a new plant document
    let plantData = {
      ...req.body,
      user: req.user.id
    };
    
    // If there's a mainImage but no images array yet
    if (mainImage && (!req.body.images || req.body.images.length === 0)) {
      plantData.images = [{ url: mainImage }];
    }
    
    // If scientific details exist, store them as notes if notes are empty
    if (scientificDetails && !req.body.notes) {
      let scientificNotes = '';
      
      if (scientificDetails.commonNames && scientificDetails.commonNames.length > 0) {
        scientificNotes += `Common names: ${scientificDetails.commonNames.join(', ')}\n\n`;
      }
      
      if (scientificDetails.description) {
        scientificNotes += `Description: ${scientificDetails.description}\n\n`;
      }
      
      if (scientificDetails.wikiUrl) {
        scientificNotes += `More info: ${scientificDetails.wikiUrl}`;
      }
      
      plantData.notes = scientificNotes;
    }
    
    console.log("Creating plant with data:", JSON.stringify(plantData, null, 2));
    const plant = await Plant.create(plantData);
    
    res.status(201).json({
      success: true,
      data: plant
    });
  } catch (err) {
    console.error('Error creating plant:', err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get all plants for user
// @route   GET /api/plants
// @access  Private
exports.getPlants = async (req, res, next) => {
  try {
    const plants = await Plant.find({ user: req.user.id });
    
    res.status(200).json({
      success: true,
      count: plants.length,
      data: plants
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get single plant
// @route   GET /api/plants/:id
// @access  Private
exports.getPlant = async (req, res, next) => {
  try {
    const plant = await Plant.findById(req.params.id);
    
    if (!plant) {
      return res.status(404).json({ success: false, error: 'Plant not found' });
    }
    
    // Make sure user owns plant
    if (plant.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this plant' });
    }
    
    res.status(200).json({
      success: true,
      data: plant
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Plant not found' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update plant
// @route   PUT /api/plants/:id
// @access  Private
exports.updatePlant = async (req, res, next) => {
  try {
    let plant = await Plant.findById(req.params.id);
    
    if (!plant) {
      return res.status(404).json({ success: false, error: 'Plant not found' });
    }
    
    // Make sure user owns plant
    if (plant.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this plant' });
    }
    
    plant = await Plant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: plant
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Plant not found' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete plant
// @route   DELETE /api/plants/:id
// @access  Private
exports.deletePlant = async (req, res, next) => {
  try {
    const plant = await Plant.findById(req.params.id);
    
    if (!plant) {
      return res.status(404).json({ success: false, error: 'Plant not found' });
    }
    
    // Make sure user owns plant
    if (plant.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this plant' });
    }
    
    await plant.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Plant not found' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update plant care history
// @route   PUT /api/plants/:id/care
// @access  Private
exports.updateCareHistory = async (req, res, next) => {
  try {
    const { actionType, notes } = req.body;
    
    const plant = await Plant.findById(req.params.id);
    
    if (!plant) {
      return res.status(404).json({ success: false, error: 'Plant not found' });
    }
    
    // Make sure user owns plant
    if (plant.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this plant' });
    }
    
    // Add to care history
    plant.careHistory.unshift({
      actionType,
      notes,
      date: Date.now()
    });
    
    // Update last action dates based on action type
    if (actionType === 'Watered') {
      plant.lastWatered = Date.now();
    } else if (actionType === 'Fertilized') {
      plant.lastFertilized = Date.now();
    } else if (actionType === 'Pruned') {
      plant.lastPruned = Date.now();
    }
    
    await plant.save();
    
    res.status(200).json({
      success: true,
      data: plant
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Add growth milestone
// @route   POST /api/plants/:id/growth
// @access  Private
exports.addGrowthMilestone = async (req, res, next) => {
  try {
    const { height, notes, imageUrl } = req.body;
    
    const plant = await Plant.findById(req.params.id);
    
    if (!plant) {
      return res.status(404).json({ success: false, error: 'Plant not found' });
    }
    
    // Make sure user owns plant
    if (plant.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this plant' });
    }
    
    // Add to growth milestones
    plant.growthMilestones.unshift({
      height,
      notes,
      imageUrl,
      date: Date.now()
    });
    
    await plant.save();
    
    res.status(200).json({
      success: true,
      data: plant
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Identify plant using plant.id API
// @route   POST /api/plants/identify
// @access  Private
exports.identifyPlant = async (req, res, next) => {
  try {
    const { imageUrl, base64Image } = req.body;
    
    if (!imageUrl && !base64Image) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide either an image URL or base64 image for identification' 
      });
    }
    
    console.log('🔍 Attempting to identify plant with image:', imageUrl ? 'URL provided' : 'Base64 image provided');
    
    // Check if plantIdentification service exists
    if (!plantIdentification) {
      console.warn('⚠️  Plant identification service not available');
      return res.status(503).json({
        success: false,
        error: 'Plant identification service is not available. Please configure the Plant.ID API key or try entering plant details manually.'
      });
    }
    
    let identificationResults;
    
    // Check if API key is configured
    if (!process.env.PLANT_ID_API_KEY) {
      console.log('🔧 No API key configured, using mock identification');
      identificationResults = await plantIdentification.mockIdentifyPlant();
    } else {
      if (imageUrl) {
        // Identify using image URL
        identificationResults = await plantIdentification.identifyPlantByUrl(imageUrl);
      } else if (base64Image) {
        // Identify using base64 image
        identificationResults = await plantIdentification.identifyPlantByBase64(base64Image);
      }
    }
    
    console.log('✅ Plant identification completed, processing results');
    
    // Process the Plant.ID v3 API response format
    if (identificationResults && identificationResults.result) {
      const result = identificationResults.result;
      
      // Extract suggestions with proper structure for v3 API
      if (result.classification && result.classification.suggestions) {
        const processedSuggestions = result.classification.suggestions.map(suggestion => {
          return {
            ...suggestion,
            // Ensure common names are easily accessible
            common_names: suggestion.details?.common_names || [],
            description: suggestion.details?.description?.value || suggestion.details?.description || '',
            taxonomy: suggestion.details?.taxonomy || {},
            family: suggestion.details?.taxonomy?.family || 'Unknown',
            genus: suggestion.details?.taxonomy?.genus || 'Unknown',
            url: suggestion.details?.url || ''
          };
        });
        
        // Update the response structure
        identificationResults.result.classification.suggestions = processedSuggestions;
      }
    }
    
    // Return the identification results
    res.status(200).json({
      success: true,
      data: identificationResults
    });
    
  } catch (err) {
    console.error('❌ Plant identification error:', err.message);
    // Log more details if available
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error identifying plant: ' + err.message,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Search plant by name using plant.id API
// @route   GET /api/plants/search?name=plantname
// @access  Private
exports.searchPlantByName = async (req, res, next) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a plant name to search' 
      });
    }
    
    console.log('🔍 Searching for plant by name:', name);
    
    // Check if plantIdentification service exists
    if (!plantIdentification || !plantIdentification.searchPlantByName) {
      return res.status(503).json({
        success: false,
        error: 'Plant search service is not available. Please configure the Plant.ID API key.'
      });
    }
    
    // Use plant identification service to search by name
    const searchResults = await plantIdentification.searchPlantByName(name);
    
    console.log('✅ Plant search completed successfully');
    
    // Return the search results
    res.status(200).json({
      success: true,
      data: searchResults
    });
    
  } catch (err) {
    console.error('❌ Plant search error:', err.message);
    
    res.status(500).json({ 
      success: false, 
      error: 'Error searching for plant: ' + err.message,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
