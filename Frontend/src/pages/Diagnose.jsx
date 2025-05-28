import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LogoOJT from '../assets/LogoOJT.png';
import { Upload, Loader, AlertCircle, CheckCircle, AlertTriangle, Camera, FileText, Calendar, Stethoscope } from 'lucide-react';
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

  // Fetch plant data if plantId is provided
  useEffect(() => {
    if (plantId) {
      fetchPlantData();
      fetchDiagnosisHistory();
    }
  }, [plantId]);

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
      
      const diagnosisData = {
        plantId: plantId || null,
        base64Image: base64Image,
        notes: notes.trim()
      };

      console.log('Sending diagnosis request...');
      const response = await diagnosisAPI.diagnoseDisease(diagnosisData);
      
      if (response.success) {
        setDiagnosisResult(response.data);
        
        // Show service info if using mock data
        if (response.data.serviceInfo && response.data.serviceInfo.usingMockData) {
          console.log('Using mock data for diagnosis');
        }
        
        // Refresh diagnosis history if we have a plantId
        if (plantId) {
          await fetchDiagnosisHistory();
        }
      } else {
        setError(response.error || 'Failed to diagnose plant disease');
      }
    } catch (err) {
      console.error('Diagnosis error:', err);
      
      // Handle specific error cases
      if (err.error) {
        if (err.error.includes('temporarily unavailable')) {
          setError('The plant disease diagnosis service is currently unavailable. Please try again later.');
        } else if (err.error.includes('API key') || err.error.includes('not configured')) {
          setError('The disease diagnosis service is running in demo mode. Some features may be limited.');
        } else if (err.error.includes('does not appear to contain a plant')) {
          setError('The uploaded image does not appear to contain a plant. Please upload a clear image of a plant.');
        } else {
          setError(err.error);
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to diagnose plant disease. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
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
              <div className="ml-2">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Plant Disease Diagnosis
                </h1>
                {plant && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Diagnosing: {plant.nickname || plant.name} ({plant.species})
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Diagnosis Section */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Upload Plant Image
                </h2>
                
                <div className="space-y-4">
                  {/* Image Upload Area */}
                  <div className="w-full aspect-square max-w-md mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center p-4">
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
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                          Supported: JPG, PNG (max 5MB)
                        </p>
                      </>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="imageUpload"
                    />
                    <label
                      htmlFor="imageUpload"
                      className="inline-block bg-green-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-green-600 transition-colors"
                    >
                      {imagePreview ? 'Change Image' : 'Choose Image'}
                    </label>
                  </div>

                  {/* Notes Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Describe symptoms, recent changes, or any concerns..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows="3"
                    />
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
                      <AlertCircle size={16} className="text-red-500 mr-2 flex-shrink-0" />
                      <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Diagnose Button */}
                  {imagePreview && (
                    <button 
                      onClick={handleDiagnose}
                      disabled={loading}
                      className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin mr-2" size={20} />
                          Analyzing Image...
                        </>
                      ) : (
                        <>
                          <Stethoscope className="mr-2" size={20} />
                          Diagnose Plant
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Diagnosis Results */}
              {diagnosisResult && (
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Diagnosis Results
                    {diagnosisResult.serviceInfo && diagnosisResult.serviceInfo.usingMockData && (
                      <span className="ml-2 text-sm font-normal text-yellow-600 dark:text-yellow-400">
                        (Demo Mode)
                      </span>
                    )}
                  </h2>
                  
                  {/* Service Status Warning */}
                  {diagnosisResult.serviceInfo && diagnosisResult.serviceInfo.usingMockData && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle size={16} className="text-yellow-500 mr-2 flex-shrink-0" />
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          {diagnosisResult.serviceInfo.message || 
                           "This is demonstration data. For real plant disease diagnosis, a Plant.ID API key is required."}
                        </p>
                      </div>
                    </div>
                  )}

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
              )}
            </div>

            {/* Sidebar - Diagnosis History */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  {plant ? 'Diagnosis History' : 'Recent Diagnoses'}
                </h3>
                
                {diagnosisHistory.length > 0 ? (
                  <div className="space-y-4">
                    {diagnosisHistory.slice(0, 5).map((diagnosis) => (
                      <div key={diagnosis._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            diagnosis.isHealthy ? 
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {diagnosis.isHealthy ? 'Healthy' : 'Issues Found'}
                          </span>
                          <Calendar size={14} className="text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(diagnosis.diagnosisDate)}
                        </p>
                        {diagnosis.diseases && diagnosis.diseases.length > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {diagnosis.diseases.length} issue(s) detected
                          </p>
                        )}
                        {diagnosis.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {diagnosis.notes}
                          </p>
                        )}
                      </div>
                    ))}
                    
                    {diagnosisHistory.length > 5 && (
                      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                        +{diagnosisHistory.length - 5} more diagnoses
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No diagnosis history yet</p>
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
