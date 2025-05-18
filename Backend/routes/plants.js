const express = require('express');
const router = express.Router();
const {
  createPlant,
  getPlants,
  getPlant,
  updatePlant,
  deletePlant,
  updateCareHistory,
  addGrowthMilestone
} = require('../controllers/plantController');

// Import auth middleware
const auth = require('../middleware/auth');

// Set auth middleware for all routes
router.use(auth);

// Routes for /api/plants
router.route('/')
  .get(getPlants)
  .post(createPlant);

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

module.exports = router;
