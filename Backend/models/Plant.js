const mongoose = require('mongoose');

const PlantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a plant name'],
    trim: true
  },
  species: {
    type: String,
    trim: true
  },
  nickname: {
    type: String,
    trim: true
  },
  images: [
    {
      url: {
        type: String,
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  mainImage: {
    type: String
  },
  location: {
    type: String,
    enum: ['Indoor', 'Outdoor', 'Balcony', 'Garden', 'Other'],
    default: 'Indoor'
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  lastWatered: {
    type: Date
  },
  lastFertilized: {
    type: Date
  },
  lastPruned: {
    type: Date
  },
  wateringFrequency: {
    type: Number, // days between watering
    default: 7
  },
  fertilizerFrequency: {
    type: Number, // days between fertilizing
    default: 30
  },
  pruningFrequency: {
    type: Number, // days between pruning
    default: 90
  },
  status: {
    type: String,
    enum: {
      values: ['Healthy', 'Needs Attention', 'Critical', 'Sick', 'Dormant'],
      message: 'Status must be one of: Healthy, Needs Attention, Critical, Sick, Dormant'
    },
    default: 'Healthy'
  },
  notes: {
    type: String
  },
  sunlightNeeds: {
    type: String,
    enum: ['Full Sun', 'Partial Sun', 'Shade', 'Low Light'],
    default: 'Partial Sun'
  },
  careHistory: [
    {
      actionType: {
        type: String,
        enum: ['Watered', 'Fertilized', 'Pruned', 'Repotted', 'Other']
      },
      date: {
        type: Date,
        default: Date.now
      },
      notes: String
    }
  ],
  growthMilestones: [
    {
      date: {
        type: Date,
        default: Date.now
      },
      height: Number, // in cm
      notes: String,
      imageUrl: String
    }
  ],
  goals: [
    {
      title: {
        type: String,
        required: true
      },
      description: String,
      completed: {
        type: Boolean,
        default: false
      },
      dueDate: Date
    }
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  // Add scientific details from plant identification
  scientificDetails: {
    scientificName: String,
    commonNames: [String],
    confidence: Number,
    taxonomy: {
      family: String,
      genus: String,
      species: String,
      class: String,
      order: String
    },
    wikiUrl: String,
    description: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to calculate days since last watering
PlantSchema.virtual('daysSinceWatered').get(function() {
  if (!this.lastWatered) return null;
  const now = new Date();
  const diff = now - this.lastWatered;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Virtual to calculate next watering date
PlantSchema.virtual('nextWateringDate').get(function() {
  if (!this.lastWatered) return null;
  const nextDate = new Date(this.lastWatered);
  nextDate.setDate(nextDate.getDate() + this.wateringFrequency);
  return nextDate;
});

// Add a virtual to determine if plant needs watering
PlantSchema.virtual('needsWatering').get(function() {
  if (!this.lastWatered) return true;
  return this.daysSinceWatered >= this.wateringFrequency;
});

// Virtual to determine if plant needs fertilizing
PlantSchema.virtual('needsFertilizing').get(function() {
  if (!this.lastFertilized) return false;
  const now = new Date();
  const diff = now - this.lastFertilized;
  const daysSinceFertilized = Math.floor(diff / (1000 * 60 * 60 * 24));
  return daysSinceFertilized >= this.fertilizerFrequency;
});

module.exports = mongoose.model('Plant', PlantSchema);