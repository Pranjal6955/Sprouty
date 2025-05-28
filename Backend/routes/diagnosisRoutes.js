const express = require('express');

// Import controller functions with error handling
let diagnosisController;
try {
  diagnosisController = require('../controllers/diagnosisController');
  console.log('✅ Diagnosis controller loaded successfully');
} catch (error) {
  console.error('❌ Error loading diagnosis controller:', error.message);
  // Create fallback controller
  diagnosisController = {
    diagnosePlantDisease: (req, res) => {
      res.status(503).json({
        success: false,
        error: 'Diagnosis service is not available'
      });
    },
    getPlantDiagnosisHistory: (req, res) => {
      res.status(503).json({
        success: false,
        error: 'Diagnosis service is not available'
      });
    },
    getUserDiagnosisHistory: (req, res) => {
      res.status(503).json({
        success: false,
        error: 'Diagnosis service is not available'
      });
    },
    getDiagnosis: (req, res) => {
      res.status(503).json({
        success: false,
        error: 'Diagnosis service is not available'
      });
    },
    updateDiagnosis: (req, res) => {
      res.status(503).json({
        success: false,
        error: 'Diagnosis service is not available'
      });
    },
    deleteDiagnosis: (req, res) => {
      res.status(503).json({
        success: false,
        error: 'Diagnosis service is not available'
      });
    },
    getDiagnosisStats: (req, res) => {
      res.status(503).json({
        success: false,
        error: 'Diagnosis service is not available'
      });
    }
  };
}

const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// Main diagnosis routes
router.route('/diagnose').post(diagnosisController.diagnosePlantDisease);
router.route('/history').get(diagnosisController.getUserDiagnosisHistory);
router.route('/stats').get(diagnosisController.getDiagnosisStats);
router.route('/plant/:plantId').get(diagnosisController.getPlantDiagnosisHistory);

// Individual diagnosis routes
router.route('/:id')
  .get(diagnosisController.getDiagnosis)
  .put(diagnosisController.updateDiagnosis)
  .delete(diagnosisController.deleteDiagnosis);

module.exports = router;
