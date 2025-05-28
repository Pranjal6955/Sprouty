import React from 'react';
import { X, Droplets, Scissors, Flower, AlertCircle, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const PlantHistoryLog = ({ isOpen, onClose, plant }) => {
  // Dummy data for plant history
  const historyData = [
    {
      type: 'water',
      date: '2024-01-15T10:30:00',
      details: 'Regular watering',
      icon: <Droplets className="text-blue-500" size={20} />,
    },
    {
      type: 'fertilize',
      date: '2024-01-12T14:45:00',
      details: 'Applied NPK fertilizer',
      icon: <Flower className="text-purple-500" size={20} />,
    },
    {
      type: 'prune',
      date: '2024-01-10T09:15:00',
      details: 'Trimmed dead leaves',
      icon: <Scissors className="text-green-500" size={20} />,
    },
    {
      type: 'diagnosis',
      date: '2024-01-08T16:20:00',
      details: 'Checked for pests - none found',
      icon: <AlertCircle className="text-yellow-500" size={20} />,
    },
    {
      type: 'water',
      date: '2024-01-05T11:00:00',
      details: 'Light watering',
      icon: <Droplets className="text-blue-500" size={20} />,
    },
    // Add more history items as needed
  ];

  const handleExportPDF = () => {
    const content = document.getElementById('history-content');
    const opt = {
      margin: 1,
      filename: `${plant.name}_history.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(content).save();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header with Export Button */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img 
                src={plant.image} 
                alt={plant.name} 
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{plant.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Activity History</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportPDF}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300 flex items-center space-x-2"
                title="Export as PDF"
              >
                <Download size={20} />
                <span className="text-sm">Export PDF</span>
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* History Timeline - Added ID for PDF export */}
        <div id="history-content" className="p-6 overflow-y-auto max-h-[60vh] scrollbar-hide">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

            {/* Timeline items */}
            <div className="space-y-6">
              {historyData.map((item, index) => (
                <div key={index} className="flex items-start ml-2">
                  <div className="relative -left-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-800 rounded-full border-2 border-gray-200 dark:border-gray-700">
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex-1 ml-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {item.type}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {item.details}
                        </p>
                      </div>
                      <time className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(item.date).toLocaleString()}
                      </time>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantHistoryLog;
