import React from 'react';
import { X, Calendar, Droplets, ThermometerSun, Wind, Sun, Ruler, FileText, Leaf, AlertTriangle } from 'lucide-react';

const PlantDetails = ({ plant, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
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

          {/* Care Information */}
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Care Instructions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <ThermometerSun size={20} className="text-orange-500 mt-1 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Light</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Bright, indirect sunlight</p>
                  </div>
                </div>
                <div className="flex items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Droplets size={20} className="text-blue-500 mt-1 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Water</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Keep soil moist but not wet</p>
                  </div>
                </div>
                <div className="flex items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Wind size={20} className="text-teal-500 mt-1 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Humidity</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Prefers high humidity</p>
                  </div>
                </div>
                <div className="flex items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Ruler size={20} className="text-violet-500 mt-1 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Size</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Can grow up to 3 feet tall</p>
                  </div>
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
