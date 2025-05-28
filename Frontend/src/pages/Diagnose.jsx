import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import LogoOJT from '../assets/LogoOJT.png';
import { Upload, Loader } from 'lucide-react';

const Diagnose = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('Diagnose');
  const [selectedImage, setSelectedImage] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event) => {
    // Image upload logic here
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
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <img src={LogoOJT} alt="Sprouty Logo" className="h-17 w-16" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white ml-2">
                Plant Disease Diagnosis
              </h1>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="text-center p-8">
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">Upload Plant Image</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Upload a clear image of the affected plant part for diagnosis
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="imageUpload"
              />
              <label
                htmlFor="imageUpload"
                className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-green-600 transition-colors"
              >
                Choose Image
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnose;
