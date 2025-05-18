const Plant = require('../models/Plant');

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
