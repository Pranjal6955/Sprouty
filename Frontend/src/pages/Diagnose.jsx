import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LogoOJT from '../assets/LogoOJT.png';
import { Upload, Loader, AlertCircle } from 'lucide-react';

const Diagnose = () => {
  const location = useLocation();
  const plantData = location.state;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('Diagnose');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        activeNavItem={activeNavItem}
        setActiveNavItem={setActiveNavItem}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <img src={LogoOJT} alt="Sprouty Logo" className="h-17 w-16" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white ml-2">
                Plant Disease Diagnosis
                {plantData?.plantName && ` - ${plantData.plantName}`}
              </h1>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Upload Section */}
              <div className="md:w-1/3 flex flex-col items-center">
                <div className="w-full aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center p-4">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <Upload size={48} className="text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 text-center">
                        Upload a clear image of the affected plant part
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageUpload"
                />
                <label
                  htmlFor="imageUpload"
                  className="mt-4 inline-block bg-green-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-green-600 transition-colors"
                >
                  {imagePreview ? 'Change Image' : 'Choose Image'}
                </label>
                {imagePreview && (
                  <button 
                    className="mt-3 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={() => {/* Add diagnosis logic */}}
                  >
                    Diagnose Plant
                  </button>
                )}
              </div>

              {/* Results Section */}
              <div className="md:w-2/3 md:border-l md:border-gray-200 dark:border-gray-700 md:pl-8">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader className="animate-spin text-green-500" size={40} />
                  </div>
                ) : diagnosisResult ? (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        {diagnosisResult.local_name}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {diagnosisResult.common_names?.map((name, index) => (
                          <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Disease Details */}
                    <div className="space-y-4">
                      {[
                        {
                          title: 'Description', 
                          content: diagnosisResult.description 
                        },
                        {
                          title: 'Cause', 
                          content: diagnosisResult.cause 
                        },
                        {
                          title: 'Classification', 
                          content: diagnosisResult.classification?.join(' → ') 
                        }
                      ].map((item, index) => (
                        <div key={index}>
                          <h3 className="font-semibold text-gray-800 dark:text-white">{item.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">{item.content}</p>
                        </div>
                      ))}
                      
                      {/* Treatment Section */}
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">Treatment & Prevention</h3>
                        <div className="mt-2 space-y-3">
                          {Object.entries(diagnosisResult?.treatment || {}).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                {key}:
                              </h4>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 py-12">
                    <AlertCircle size={48} className="mb-4" />
                    <p>Upload an image to see diagnosis results</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnose;
