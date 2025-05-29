import React, { useState, useEffect } from 'react';
import { Droplets, AlertCircle, Scissors, Flower, X, Calendar, ChevronLeft, ChevronRight, FileText, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const PlantHistoryLog = ({ isOpen, onClose, plant }) => {
  const [activeMonth, setActiveMonth] = useState(new Date());
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    if (plant && isOpen) {
      // Convert plant care history to our format
      const historyItems = [];
      
      // Process care history if available
      if (plant.careHistory && Array.isArray(plant.careHistory)) {
        plant.careHistory.forEach(item => {
          let type = '';
          let icon = null;
          
          switch(item.actionType) {
            case 'Watered':
              type = 'water';
              icon = <Droplets className="text-blue-500" size={20} />;
              break;
            case 'Fertilized':
              type = 'fertilize';
              icon = <Flower className="text-purple-500" size={20} />;
              break;
            case 'Pruned':
              type = 'prune';
              icon = <Scissors className="text-green-500" size={20} />;
              break;
            case 'Repotted':
              type = 'repot';
              icon = <AlertCircle className="text-yellow-500" size={20} />;
              break;
            default:
              type = 'other';
              icon = <FileText className="text-gray-500" size={20} />;
          }
          
          historyItems.push({
            type,
            date: new Date(item.date),
            details: item.notes || `${item.actionType} plant`,
            icon,
            isReminder: false
          });
        });
      }
      
      // Sort by date, most recent first
      historyItems.sort((a, b) => b.date - a.date);
      
      setHistoryData(historyItems);
      filterHistoryByMonth(historyItems, activeMonth);
    }
  }, [plant, isOpen, activeMonth]);

  const filterHistoryByMonth = (history, month) => {
    const filtered = history.filter(item => {
      return item.date.getMonth() === month.getMonth() && 
             item.date.getFullYear() === month.getFullYear();
    });
    setFilteredHistory(filtered);
  };

  const handlePrevMonth = () => {
    const prevMonth = new Date(activeMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setActiveMonth(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(activeMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setActiveMonth(nextMonth);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const monthYearString = activeMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {plant.name} History
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800">
          <button 
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
          >
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h3 className="font-medium text-gray-800 dark:text-gray-100">{monthYearString}</h3>
          <button 
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
          >
            <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6" id="history-content">
          <div className="space-y-6">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-gray-900 dark:text-gray-100 font-medium capitalize">
                        {item.type} {item.isReminder ? 'Reminder' : 'Action'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(item.date)}
                      </p>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {item.details}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                <p className="mt-2 text-gray-500 dark:text-gray-400">No history recorded for {monthYearString}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex justify-end">
          <button
            onClick={handleExportPDF}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} className="mr-2" />
            Export as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantHistoryLog;
