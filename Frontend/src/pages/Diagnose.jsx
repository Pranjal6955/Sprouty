import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LogoOJT from '../assets/LogoOJT.png';
import { Upload, Loader, AlertCircle, CheckCircle, AlertTriangle, Camera, FileText, Calendar, Stethoscope, X } from 'lucide-react';
import { diagnosisAPI, plantAPI } from '../services/api';

const Diagnose = () => {
  const location = useLocation();
  const { plantId } = useParams();
  const plantData = location.state;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('Diagnose');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState('');
  const [plant, setPlant] = useState(null);
  const [diagnosisHistory, setDiagnosisHistory] = useState([]);
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showDiagnoseModal, setShowDiagnoseModal] = useState(false);

  // Fetch plant data if plantId is provided
  useEffect(() => {
    if (plantId) {
      fetchPlantData();
      fetchDiagnosisHistory();
    }
  }, [plantId]);

  // Fetch all plants when component mounts
  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlantData = async () => {
    try {
      const response = await plantAPI.getPlant(plantId);
      if (response.success) {
        setPlant(response.data);
      }
    } catch (error) {
      console.error('Error fetching plant data:', error);
    }
  };

  const fetchDiagnosisHistory = async () => {
    try {
      const response = await diagnosisAPI.getPlantDiagnosisHistory(plantId);
      if (response.success) {
        setDiagnosisHistory(response.data);
      }
    } catch (error) {
      console.error('Error fetching diagnosis history:', error);
    }
  };

  const fetchPlants = async () => {
    try {
      const response = await plantAPI.getPlants();
      if (response.success) {
        setPlants(response.data);
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }

      setSelectedImage(file);
      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiagnose = async () => {
    if (!imagePreview) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert image to base64 (remove data URL prefix)
      const base64Image = imagePreview.split(',')[1];
      
      if (!base64Image) {
        setError('Invalid image format. Please try a different image.');
        setLoading(false);
        return;
      }
      
      console.log('Image processed successfully. Base64 length:', base64Image.length);
      
      const diagnosisData = {
        plantId: plantId || null,
        base64Image: base64Image,
        notes: notes.trim()
      };

      console.log('Sending diagnosis request to backend API...');
      console.log('Request data:', {
        hasPlantId: !!plantId,
        hasImage: !!base64Image,
        hasNotes: !!notes.trim(),
        imageSize: base64Image ? `${(base64Image.length * 0.75 / 1024).toFixed(2)} KB` : 'N/A'
      });

      // Add a timeout to automatically handle hanging requests
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.warn('Diagnosis request taking too long, might have stalled');
          setError('The diagnosis is taking longer than expected. You may continue waiting or try again with a different image.');
        }
      }, 45000); // 45 seconds timeout warning
      
      try {
        const response = await diagnosisAPI.diagnoseDisease(diagnosisData);
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        console.log('Diagnosis response received:', {
          success: response.success,
          hasData: !!response.data,
          usingMockData: response.data?.serviceInfo?.usingMockData,
          apiAvailable: response.data?.serviceInfo?.apiAvailable,
          serviceMessage: response.data?.serviceInfo?.message
        });
        
        if (response.success) {
          setDiagnosisResult(response.data);
          
          // Show service info
          if (response.data.serviceInfo) {
            if (response.data.serviceInfo.usingMockData) {
              console.log('⚠ Using mock data:', response.data.serviceInfo.message);
            } else {
              console.log('✅ Real diagnosis completed');
            }
          }
          
          // Refresh diagnosis history if we have a plantId
          if (plantId) {
            await fetchDiagnosisHistory();
          }
        } else {
          setError(response.error || 'Failed to diagnose plant disease');
        }
      } catch (err) {
        // Clear the timeout in case of error
        clearTimeout(timeoutId);
        throw err; // Rethrow to be handled by the outer catch
      }
    } catch (err) {
      console.error('Diagnosis error:', err);
      
      // Handle specific error cases
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.error) {
        setError(err.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to diagnose plant disease. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDiagnose = (plant) => {
    // Instead of showing modal, navigate to a new view
    setSelectedPlant(plant);
    // Clear previous diagnosis data
    setImagePreview(null);
    setSelectedImage(null);
    setDiagnosisResult(null);
    setError(null);
    setNotes('');
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCareDate = (dateString) => {
    if (!dateString || dateString === 'Invalid Date') return 'Not yet set';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Not yet set';
    return date.toLocaleDateString();
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
              <img src={LogoOJT} alt="Logo" className="h-10 w-10 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Plant Disease Diagnosis
              </h1>
            </div>
          </div>

          {selectedPlant ? (
            // Split View for Diagnosis
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Section - Upload */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Upload size={24} />
                    Upload Image
                  </h2>
                  <button
                    onClick={() => setSelectedPlant(null)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Plant Info */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <img
                      src={selectedPlant.image}
                      alt={selectedPlant.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedPlant.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedPlant.species}
                      </p>
                    </div>
                  </div>

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setImagePreview(null);
                            setSelectedImage(null);
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer"
                        onClick={() => document.getElementById('fileInput').click()}
                      >
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Click to upload or drag and drop</p>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />

                  {/* Notes Area */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Diagnosis Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Describe any symptoms or concerns..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
                      rows="4"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleDiagnose}
                    disabled={!imagePreview || loading}
                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                        Analyzing...
                      </span>
                    ) : (
                      'Start Diagnosis'
                    )}
                  </button>
                </div>
              </div>

              {/* Right Section - Results */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Stethoscope size={24} />
                  Diagnosis Results
                </h2>

                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Loader className="h-12 w-12 animate-spin text-green-500 mx-auto" />
                      <p className="mt-4 text-gray-600">Analyzing plant condition...</p>
                    </div>
                  </div>
                ) : diagnosisResult ? (
                  <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-20rem)]">
                    {/* Keep all your existing diagnosis result UI code */}
                    {/* This preserves all the detailed disease information */}
                    {/* Just removing the outer container classes to fit the new layout */}
                    {/* Health Status */}
                    <div className="mb-6 p-4 rounded-lg border">
                      <div className="flex items-center mb-2">
                        {diagnosisResult.summary.isHealthy ? (
                          <CheckCircle className="text-green-500 mr-2" size={24} />
                        ) : (
                          <AlertTriangle className="text-red-500 mr-2" size={24} />
                        )}
                        <h3 className="text-lg font-medium">
                          {diagnosisResult.summary.isHealthy ? 'Plant Appears Healthy' : 'Issues Detected'}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Overall Health: <span className="font-medium capitalize">{diagnosisResult.summary.overallHealth}</span>
                      </p>
                      {diagnosisResult.summary.treatmentPriority !== 'low' && (
                        <p className="text-sm mt-1">
                          Treatment Priority: 
                          <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(diagnosisResult.summary.treatmentPriority)}`}>
                            {diagnosisResult.summary.treatmentPriority.toUpperCase()}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Diseases */}
                    {diagnosisResult.diagnosis.diseases && diagnosisResult.diagnosis.diseases.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-3">Detected Diseases</h4>
                        <div className="space-y-4">
                          {diagnosisResult.diagnosis.diseases.map((disease, index) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium text-gray-800 dark:text-white">{disease.name}</h5>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(disease.severity)}`}>
                                    {disease.severity}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {Math.round(disease.probability * 100)}% confidence
                                  </span>
                                </div>
                              </div>
                              
                              {disease.common_names && disease.common_names.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Also known as: {disease.common_names.join(', ')}
                                  </p>
                                </div>
                              )}
                              
                              {disease.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{disease.description}</p>
                              )}
                              
                              {disease.treatment && Object.keys(disease.treatment).length > 0 && (
                                <div className="mt-3">
                                  <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Treatment Options:</h6>
                                  <div className="space-y-1">
                                    {Object.entries(disease.treatment).map(([type, treatment]) => (
                                      treatment && (
                                        <div key={type} className="text-sm">
                                          <span className="font-medium capitalize text-gray-600 dark:text-gray-400">{type}:</span>
                                          <span className="ml-1 text-gray-600 dark:text-gray-400">{treatment}</span>
                                        </div>
                                      )
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {diagnosisResult.diagnosis.recommendations && (
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white mb-3">Recommendations</h4>
                        <div className="space-y-3">
                          {diagnosisResult.diagnosis.recommendations.immediate_actions && diagnosisResult.diagnosis.recommendations.immediate_actions.length > 0 && (
                            <div>
                              <h6 className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Immediate Actions:</h6>
                              <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                                {diagnosisResult.diagnosis.recommendations.immediate_actions.map((action, index) => (
                                  <li key={index}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {diagnosisResult.diagnosis.recommendations.preventive_measures && diagnosisResult.diagnosis.recommendations.preventive_measures.length > 0 && (
                            <div>
                              <h6 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Preventive Measures:</h6>
                              <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                                {diagnosisResult.diagnosis.recommendations.preventive_measures.map((measure, index) => (
                                  <li key={index}>{measure}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                      <p>Upload an image to see diagnosis results</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Plant Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plants.map((plant) => (
                <div key={plant._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  {/* Plant Image */}
                  <div className="relative h-48">
                    <img
                      src={plant.image || 'default-plant.jpg'}
                      alt={plant.name}
                      className="w-full h-full object-cover rounded-t-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-xl" />
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-xl font-bold text-white">{plant.name}</h3>
                      <p className="text-sm text-gray-200">{plant.species}</p>
                    </div>
                  </div>

                  {/* Plant Details */}
                  <div className="p-4 space-y-4">
                    {/* Health Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Health Status</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        plant.health === 'Healthy' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                        plant.health === 'Needs Attention' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {plant.health}
                      </span>
                    </div>

                    {/* Care Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Last Watered</p>
                        <p className="font-medium text-gray-700 dark:text-gray-200">
                          {plant.lastWatered ? formatCareDate(plant.lastWatered) : 'Not yet watered'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Last Fertilized</p>
                        <p className="font-medium text-gray-700 dark:text-gray-200">
                          {plant.lastFertilized ? formatCareDate(plant.lastFertilized) : 'Not yet fertilized'}
                        </p>
                      </div>
                    </div>

                    {/* View Diagnose Button */}
                    <button
                      onClick={() => handleViewDiagnose(plant)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2 dark:bg-green-600 dark:hover:bg-green-700"
                    >
                      <Stethoscope size={18} />
                      View Diagnose
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Diagnose;