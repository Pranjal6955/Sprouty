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
      
      if (scientificDetails.taxonomy && scientificDetails.taxonomy.family) {
        scientificNotes += `Family: ${scientificDetails.taxonomy.family}\n`;
      }
      
      if (scientificDetails.taxonomy && scientificDetails.taxonomy.genus) {
        scientificNotes += `Genus: ${scientificDetails.taxonomy.genus}\n`;
      }
      
      if (scientificDetails.wikiUrl) {
        scientificNotes += `\nMore info: ${scientificDetails.wikiUrl}`;
      }
      
      plantData.notes = scientificNotes;
    }
    
    // Store scientific details separately for future use
    if (scientificDetails) {
      plantData.scientificDetails = scientificDetails;
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
    console.log('Update plant request:', {
      plantId: req.params.id,
      userId: req.user.id,
      updateData: req.body
    });

    let plant = await Plant.findById(req.params.id);
    
    if (!plant) {
      console.log('Plant not found:', req.params.id);
      return res.status(404).json({ success: false, error: 'Plant not found' });
    }
    
    // Make sure user owns plant
    if (plant.user.toString() !== req.user.id) {
      console.log('Unauthorized update attempt:', {
        plantOwner: plant.user.toString(),
        requestUser: req.user.id
      });
      return res.status(401).json({ success: false, error: 'Not authorized to update this plant' });
    }

    // Validate status field if it's being updated
    if (req.body.status && !['Healthy', 'Needs Attention', 'Critical', 'Sick', 'Dormant'].includes(req.body.status)) {
      console.log('Invalid status value:', req.body.status);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status value. Must be one of: Healthy, Needs Attention, Critical, Sick, Dormant' 
      });
    }

    // Log the update operation
    console.log('Updating plant with data:', req.body);
    
    plant = await Plant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    console.log('Plant updated successfully:', {
      plantId: plant._id,
      newStatus: plant.status
    });
    
    res.status(200).json({
      success: true,
      data: plant
    });
  } catch (err) {
    console.error('Update plant error:', {
      error: err.message,
      stack: err.stack,
      plantId: req.params.id,
      updateData: req.body
    });

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({
        success: false,
        error: 'Validation Error: ' + messages.join(', ')
      });
    }

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Plant not found' });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Server Error while updating plant',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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
        error: 'Plant identification service is not available. Please configure the Plant.ID API key.'
      });
    }
    
    let identificationResults;
    
    // Check if API key is configured
    if (!process.env.PLANT_ID_API_KEY) {
      console.log('🔧 No API key configured, returning error with mock suggestion');
      return res.status(503).json({
        success: false,
        error: 'Plant identification service requires API key configuration. Please contact administrator.',
        mock_available: true,
        suggestion: 'You can still add plants manually using the text search or manual entry options.'
      });
    } else {
      try {
        if (imageUrl) {
          // Identify using image URL
          identificationResults = await plantIdentification.identifyPlantByUrl(imageUrl);
        } else if (base64Image) {
          // Identify using base64 image
          identificationResults = await plantIdentification.identifyPlantByBase64(base64Image);
        }
        
        console.log('✅ Plant identification completed successfully');
      } catch (apiError) {
        console.error('❌ Plant.ID API failed:', apiError.message);
        
        return res.status(503).json({
          success: false,
          error: 'Plant identification service is temporarily unavailable: ' + apiError.message,
          suggestion: 'Please try again later or add your plant manually.'
        });
      }
    }
    
    // Process the Plant.ID v3 API response format
    if (identificationResults && identificationResults.result) {
      const result = identificationResults.result;
      
      // Extract suggestions with proper structure for v3 API
      if (result.classification && result.classification.suggestions) {
        const processedSuggestions = result.classification.suggestions.map((suggestion, index) => {
          console.log(`🔍 Processing suggestion ${index + 1}: ${suggestion.name}`);
          
          // Try to get plant details from various locations
          let commonNames = [];
          let description = '';
          let taxonomy = {};
          let url = '';
          
          // Method 1: Direct common_names property
          if (suggestion.common_names && Array.isArray(suggestion.common_names) && suggestion.common_names.length > 0) {
            commonNames = suggestion.common_names;
            console.log(`✅ Found common names (method 1): ${commonNames.join(', ')}`);
          }
          // Method 2: From details object
          else if (suggestion.details?.common_names && Array.isArray(suggestion.details.common_names) && suggestion.details.common_names.length > 0) {
            commonNames = suggestion.details.common_names;
            console.log(`✅ Found common names (method 2): ${commonNames.join(', ')}`);
          }
          // Method 3: Check if details has other name properties
          else if (suggestion.details && typeof suggestion.details === 'object') {
            console.log('Checking details object for common names...');
            console.log('Available details keys:', Object.keys(suggestion.details));
            
            // Look for any property that might contain common names
            const nameKeys = ['common_names', 'commonNames', 'names', 'vernacular_names', 'synonyms'];
            for (const key of nameKeys) {
              if (suggestion.details[key] && Array.isArray(suggestion.details[key]) && suggestion.details[key].length > 0) {
                commonNames = suggestion.details[key];
                console.log(`✅ Found common names (method 3, key: ${key}): ${commonNames.join(', ')}`);
                break;
              }
            }
          }
          
          if (commonNames.length === 0) {
            console.log(`⚠️  No common names found for ${suggestion.name} - using scientific name only`);
          }
          
          // Get other details
          if (suggestion.details) {
            description = suggestion.details.description?.value || suggestion.details.description || '';
            taxonomy = suggestion.details.taxonomy || {};
            url = suggestion.details.url || '';
          }
          
          const processed = {
            ...suggestion,
            // Add common names at the top level for easy access
            common_names: commonNames,
            description: description,
            taxonomy: taxonomy,
            family: taxonomy.family || 'Unknown',
            genus: taxonomy.genus || 'Unknown',
            url: url
          };
          
          console.log(`📋 Final processed suggestion:`, {
            name: processed.name,
            common_names: processed.common_names,
            has_description: !!processed.description,
            probability: processed.probability
          });
          
          return processed;
        });
        
        console.log(`Processed ${processedSuggestions.length} suggestions`);
        
        // Update the response structure
        identificationResults.result.classification.suggestions = processedSuggestions;
      }
    }
    
    // Return the identification results
    res.status(200).json({
      success: true,
      data: identificationResults,
      source: 'plant_id_api'
    });
    
  } catch (err) {
    console.error('❌ Plant identification error:', err.message);
    
    res.status(500).json({ 
      success: false, 
      error: 'Plant identification service encountered an error. Please try again later or add your plant manually.',
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
    
    // Check if API key is configured
    if (!process.env.PLANT_ID_API_KEY) {
      return res.status(503).json({
        success: false,
        error: 'Plant search service requires API key configuration. Please contact administrator.'
      });
    }
    
    // Use plant identification service to search by name
    const searchResults = await plantIdentification.searchPlantByName(name);
    
    console.log('✅ Plant search completed successfully');
    console.log('Search results structure:', {
      hasEntities: !!searchResults.entities,
      entitiesCount: searchResults.entities?.length || 0
    });
    
    // Process search results to get detailed information
    if (searchResults.entities && searchResults.entities.length > 0) {
      const processedResults = await Promise.all(
        searchResults.entities.slice(0, 5).map(async (entity, index) => {
          console.log(`Processing search result ${index + 1}: ${entity.matched_in}`);
          
          let detailedInfo = {
            name: entity.matched_in,
            entity_name: entity.entity_name,
            common_names: entity.common_names || [],
            matched_in: entity.matched_in,
            access_token: entity.access_token
          };
          
          // Try to get more detailed information using the entity access token
          if (entity.access_token) {
            try {
              console.log(`Fetching detailed info for: ${entity.entity_name}`);
              const detailsResponse = await plantIdentification.getPlantDetails(entity.access_token);
              
              if (detailsResponse) {
                detailedInfo.details = {
                  common_names: detailsResponse.common_names || entity.common_names || [],
                  description: detailsResponse.description || '',
                  taxonomy: detailsResponse.taxonomy || {},
                  url: detailsResponse.url || '',
                  images: detailsResponse.images || [],
                  synonyms: detailsResponse.synonyms || []
                };
                
                console.log(`✅ Got detailed info for ${entity.entity_name}:`, {
                  hasCommonNames: !!detailsResponse.common_names,
                  commonNamesCount: detailsResponse.common_names?.length || 0,
                  hasDescription: !!detailsResponse.description,
                  hasTaxonomy: !!detailsResponse.taxonomy
                });
              }
            } catch (detailError) {
              console.warn(`Could not fetch details for ${entity.entity_name}:`, detailError.message);
              // Use basic info from search result
              detailedInfo.details = {
                common_names: entity.common_names || [],
                description: '',
                taxonomy: {},
                url: '',
                images: [],
                synonyms: []
              };
            }
          } else {
            // Use basic info from search result
            detailedInfo.details = {
              common_names: entity.common_names || [],
              description: '',
              taxonomy: {},
              url: '',
              images: [],
              synonyms: []
            };
          }
          
          console.log(`📋 Final processed search result:`, {
            name: detailedInfo.name,
            entity_name: detailedInfo.entity_name,
            common_names: detailedInfo.details.common_names,
            has_description: !!detailedInfo.details.description
          });
          
          return detailedInfo;
        })
      );
      
      // Return formatted response
      res.status(200).json({
        success: true,
        data: {
          suggestions: processedResults,
          total: searchResults.entities.length
        }
      });
    } else {
      res.status(200).json({
        success: true,
        data: {
          suggestions: [],
          total: 0
        }
      });
    }
    
  } catch (err) {
    console.error('❌ Plant search error:', err.message);
    
    res.status(500).json({ 
      success: false, 
      error: 'Error searching for plant: ' + err.message,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Record watering action
// @route   POST /api/plants/:id/water
// @access  Private
exports.waterPlant = async (req, res, next) => {
  try {
    const { notes, amount } = req.body;
    
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
      actionType: 'Watered',
      notes: notes || `Watered${amount ? ` with ${amount}ml` : ''}`,
      date: Date.now()
    });
    
    // Update last watered date
    plant.lastWatered = Date.now();
    
    await plant.save();
    
    res.status(200).json({
      success: true,
      data: plant,
      message: 'Plant watered successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Record fertilizing action
// @route   POST /api/plants/:id/fertilize
// @access  Private
exports.fertilizePlant = async (req, res, next) => {
  try {
    const { notes, fertilizerType } = req.body;
    
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
      actionType: 'Fertilized',
      notes: notes || `Fertilized${fertilizerType ? ` with ${fertilizerType}` : ''}`,
      date: Date.now()
    });
    
    // Update last fertilized date
    plant.lastFertilized = Date.now();
    
    await plant.save();
    
    res.status(200).json({
      success: true,
      data: plant,
      message: 'Plant fertilized successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Record pruning action
// @route   POST /api/plants/:id/prune
// @access  Private
exports.prunePlant = async (req, res, next) => {
  try {
    const { notes, pruningType } = req.body;
    
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
      actionType: 'Pruned',
      notes: notes || `Pruned${pruningType ? ` - ${pruningType}` : ''}`,
      date: Date.now()
    });
    
    // Update last pruned date
    plant.lastPruned = Date.now();
    
    await plant.save();
    
    res.status(200).json({
      success: true,
      data: plant,
      message: 'Plant pruned successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get plant care schedule
// @route   GET /api/plants/:id/schedule
// @access  Private
exports.getPlantSchedule = async (req, res, next) => {
  try {
    const plant = await Plant.findById(req.params.id);
    
    if (!plant) {
      return res.status(404).json({ success: false, error: 'Plant not found' });
    }
    
    // Make sure user owns plant
    if (plant.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this plant' });
    }
    
    const now = new Date();
    
    // Calculate next care dates
    const schedule = {
      nextWatering: plant.lastWatered ? 
        new Date(new Date(plant.lastWatered).getTime() + (plant.wateringFrequency * 24 * 60 * 60 * 1000)) : null,
      nextFertilizing: plant.lastFertilized ? 
        new Date(new Date(plant.lastFertilized).getTime() + (plant.fertilizerFrequency * 24 * 60 * 60 * 1000)) : null,
      nextPruning: plant.lastPruned ? 
        new Date(new Date(plant.lastPruned).getTime() + (plant.pruningFrequency * 24 * 60 * 60 * 1000)) : null,
      
      // Days until next care
      daysUntilWatering: plant.lastWatered ? 
        Math.ceil((new Date(plant.lastWatered).getTime() + (plant.wateringFrequency * 24 * 60 * 60 * 1000) - now.getTime()) / (24 * 60 * 60 * 1000)) : 0,
      daysUntilFertilizing: plant.lastFertilized ? 
        Math.ceil((new Date(plant.lastFertilized).getTime() + (plant.fertilizerFrequency * 24 * 60 * 60 * 1000) - now.getTime()) / (24 * 60 * 60 * 1000)) : 0,
      daysUntilPruning: plant.lastPruned ? 
        Math.ceil((new Date(plant.lastPruned).getTime() + (plant.pruningFrequency * 24 * 60 * 60 * 1000) - now.getTime()) / (24 * 60 * 60 * 1000)) : 0,
    };
    
    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
