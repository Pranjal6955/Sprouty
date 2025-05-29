import React, { useState } from 'react';
import { X, Calendar, Stethoscope, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const PlantDiagnoseLog = ({ isOpen, onClose, plant, diagnoseHistory }) => {
  const [activeMonth, setActiveMonth] = useState(new Date());

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

  const monthYearString = activeMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Filter diagnoses for current month
  const filteredDiagnoses = diagnoseHistory.filter(diagnosis => {
    const diagnosisDate = new Date(diagnosis.date);
    return diagnosisDate.getMonth() === activeMonth.getMonth() && 
           diagnosisDate.getFullYear() === activeMonth.getFullYear();
  });

  const handleExportPDF = () => {
    const content = document.getElementById('diagnose-history-content');
    const opt = {
      margin: 1,
      filename: `${plant.name}_diagnose_history.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(content).save();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Stethoscope size={24} />
            {plant.name} Diagnosis History
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

        <div className="flex-1 overflow-y-auto p-6" id="diagnose-history-content">
          {filteredDiagnoses.length > 0 ? (
            <div className="space-y-6">
              {filteredDiagnoses.map((diagnosis, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                    <Stethoscope className="text-green-500" size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                        Plant Disease Diagnosis
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(diagnosis.date)}
                      </p>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {diagnosis.notes || 'No notes provided'}
                    </p>
                    {diagnosis.result && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Diagnosis Result:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {diagnosis.result.summary || 'No detailed result available'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
              <p className="mt-2 text-gray-500 dark:text-gray-400">No diagnoses recorded for {monthYearString}</p>
            </div>
          )}
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

export default PlantDiagnoseLog;
