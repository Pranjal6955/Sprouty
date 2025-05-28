const mongoose = require('mongoose');

const PlantDiagnosisSchema = new mongoose.Schema({
  plant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Plant',
    required: false // Make this optional to allow standalone diagnoses
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  diagnosisImage: {
    type: String,
    required: true
  },
  diagnosisDate: {
    type: Date,
    default: Date.now
  },
  isHealthy: {
    type: Boolean,
    default: true
  },
  healthProbability: {
    type: Number,
    min: 0,
    max: 1,
    default: 1
  },
  diseases: [{
    name: String,
    common_names: [String],
    probability: Number,
    description: String,
    cause: String,
    treatment: {
      chemical: String,
      organic: String,
      cultural: String,
      biological: String
    },
    prevention: String,
    classification: [String],
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    entity_id: String
  }],
  pests: [{
    name: String,
    common_names: [String],
    probability: Number,
    description: String,
    treatment: {
      chemical: String,
      organic: String,
      cultural: String,
      biological: String
    },
    prevention: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    }
  }],
  overallHealth: {
    type: String,
    enum: ['healthy', 'diseased', 'critical'],
    default: 'healthy'
  },
  recommendations: {
    immediate_actions: [String],
    preventive_measures: [String],
    monitoring: [String],
    treatment_priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    }
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedDate: {
    type: Date
  },
  // Plant identification info for standalone diagnoses
  identifiedPlant: {
    scientificName: String,
    commonNames: [String],
    confidence: Number,
    description: String
  }
}, {
  timestamps: true
});

// Index for better query performance
PlantDiagnosisSchema.index({ plant: 1, diagnosisDate: -1 });
PlantDiagnosisSchema.index({ user: 1, diagnosisDate: -1 });
PlantDiagnosisSchema.index({ isHealthy: 1, resolved: 1 });

module.exports = mongoose.model('PlantDiagnosis', PlantDiagnosisSchema);
