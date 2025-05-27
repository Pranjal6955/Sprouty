const express = require('express');
const router = express.Router();
const {
  createPlant,
  getPlants,
  getPlant,
  updatePlant,
  deletePlant,
  updateCareHistory,
  addGrowthMilestone,
  identifyPlant,
  searchPlantByName,
  waterPlant,
  fertilizePlant,
  prunePlant,
  getPlantSchedule
} = require('../controllers/plantController');

// Import auth middleware - FIX: Import the destructured protect function
const { protect } = require('../middleware/auth');

// Set auth middleware for all routes
router.use(protect);

// Routes for /api/plants
router.route('/')
  .get(getPlants)
  .post(createPlant);

// Plant identification route - MUST be before /:id routes
router.route('/identify')
  .post(identifyPlant);

// Plant search route - MUST be before /:id routes  
router.route('/search')
  .get(searchPlantByName);

// Routes for /api/plants/:id
router.route('/:id')
  .get(getPlant)
  .put(updatePlant)
  .delete(deletePlant);

// Routes for care history
router.route('/:id/care')
  .put(updateCareHistory);

// Routes for growth milestones
router.route('/:id/growth')
  .post(addGrowthMilestone);

// Plant care action routes
router.route('/:id/water')
  .post(waterPlant);

router.route('/:id/fertilize')
  .post(fertilizePlant);

router.route('/:id/prune')
  .post(prunePlant);

router.route('/:id/schedule')
  .get(getPlantSchedule);

module.exports = router;
