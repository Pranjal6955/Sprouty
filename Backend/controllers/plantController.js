const Plant = require('../models/Plant');
const axios = require('axios');
const plantIdentification = require('../services/plantIdentification');

// @desc    Create new plant
// @route   POST /api/plants
// @access  Private
exports.createPlant = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    
    const plant = await Plant.create(req.body);
    
    res.status(201).json({
      success: true,
      data: plant
    });
  } catch (err) {
    console.error(err.message);
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
    
    console.log('Attempting to identify plant with image:', imageUrl ? 'URL provided' : 'Base64 image provided');
    
    let identificationResults;
    
    if (imageUrl) {
      // Identify using image URL
      identificationResults = await plantIdentification.identifyPlantByUrl(imageUrl);
    } else if (base64Image) {
      // Identify using base64 image
      identificationResults = await plantIdentification.identifyPlantByBase64(base64Image);
    }
    
    console.log('Plant identification successful, processing results');
    
    // Extract simplified plant data, with emphasis on common name
    const simplifiedData = plantIdentification.extractPlantData(identificationResults);
    
    // Ensure common name is used instead of scientific name
    if (simplifiedData && simplifiedData.suggestions && simplifiedData.suggestions.length > 0) {
      // Prioritize common name display for each suggestion
      simplifiedData.suggestions = simplifiedData.suggestions.map(suggestion => {
        return {
          ...suggestion,
          plant_name: suggestion.plant_common_names && suggestion.plant_common_names.length > 0 
            ? suggestion.plant_common_names[0] 
            : suggestion.plant_name // fallback to whatever name is available
        };
      });
    }
    
    // Return the identification results
    res.status(200).json({
      success: true,
      data: identificationResults,
      simplifiedData
    });
    
  } catch (err) {
    console.error('Plant identification error:', err.message);
    // Log more details if available
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error identifying plant',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
