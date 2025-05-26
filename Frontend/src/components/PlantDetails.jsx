import React from 'react';
import { 
  X, Calendar, Droplets, ThermometerSun, Wind, Sun, 
  Ruler, FileText, Leaf, AlertTriangle, Info, 
  FlowerIcon, Sprout, ShieldAlert, Globe
} from 'lucide-react';

const PlantDetails = ({ plant, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header with image */}
        <div className="relative h-64 sm:h-72">
          <img 
            src={plant.image} 
            alt={plant.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-4 left-6 text-white">
            <h2 className="text-2xl font-bold">{plant.nickname}</h2>
            <p className="text-sm opacity-90">{plant.species}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-18rem)]">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center text-gray-600 dark:text-gray-300 mb-1">
                <Calendar size={16} className="mr-2" />
                <span className="text-sm">Added</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{plant.dateAdded}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center text-gray-600 dark:text-gray-300 mb-1">
                <Droplets size={16} className="mr-2 text-blue-500" />
                <span className="text-sm">Last Watered</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{plant.lastWatered}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center text-gray-600 dark:text-gray-300 mb-1">
                <Leaf size={16} className="mr-2 text-green-500" />
                <span className="text-sm">Health</span>
              </div>
              <p className={`font-medium ${
                plant.health === 'Healthy' ? 'text-green-600 dark:text-green-400' :
                plant.health === 'Needs Attention' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>{plant.health}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center text-gray-600 dark:text-gray-300 mb-1">
                <FileText size={16} className="mr-2" />
                <span className="text-sm">Species</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{plant.species}</p>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="space-y-6 mt-6">
            {/* Basic Information */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Info className="mr-2" size={20} />
                Plant Information
              </h3>
              <div className="grid gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Common Names</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {plant.commonNames?.join(', ') || plant.nickname}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Description</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {plant.description || "A beautiful plant that adds life to any space. This species is known for its distinctive features and growth patterns."}
                  </p>
                </div>
              </div>
            </section>

            {/* Usage & Benefits */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <FlowerIcon className="mr-2" size={20} />
                Usage & Benefits
              </h3>
              <div className="grid gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Edible Parts</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {plant.edibleParts || "No edible parts known for this plant."}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Medicinal Uses</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {plant.medicinalUses || "No known medicinal properties."}
                  </p>
                </div>
              </div>
            </section>

            {/* Detailed Care Instructions */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Sprout className="mr-2" size={20} />
                Detailed Care Guide
              </h3>
              <div className="grid gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Watering Method</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {plant.wateringMethod || "Water thoroughly when the top inch of soil feels dry. Ensure good drainage and avoid water logging. Best watered in the morning."}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Lighting Conditions</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {plant.lightingConditions || "Thrives in bright, indirect sunlight. Protect from harsh afternoon sun. Can tolerate some shade but may affect growth rate."}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Soil Requirements</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {plant.soilType || "Well-draining, rich potting mix. Prefers slightly acidic soil with good organic content. Add perlite for improved drainage."}
                  </p>
                </div>
              </div>
            </section>

            {/* Safety & Cultural Information */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <ShieldAlert className="mr-2" size={20} />
                  Toxicity Information
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                    plant.isToxic ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {plant.isToxic ? 'Toxic' : 'Non-toxic'}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {plant.toxicityInfo || "No specific toxicity information available. Always keep plants out of reach of children and pets."}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <Globe className="mr-2" size={20} />
                  Cultural Significance
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    {plant.culturalSignificance || "This plant has been cultivated for generations and is valued in many cultures for its beauty and benefits."}
                  </p>
                </div>
              </div>
            </section>

            {/* Notes */}
            {plant.notes && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Notes</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{plant.notes}</p>
                </div>
              </section>
            )}

            {/* Warnings or Alerts */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/50 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-500 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-400">Care Reminder</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Next watering scheduled in 2 days. Keep an eye on soil moisture.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDetails;