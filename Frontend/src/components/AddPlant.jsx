import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, ArrowLeft, Loader, Info, Maximize, Droplets, Sun, Wind, Thermometer, 
         Globe, Leaf, Bookmark, FlowerIcon, Calendar, Upload, Image, Search } from 'lucide-react';
import Webcam from 'react-webcam';
import { plantAPI } from '../services/api';
import { useTheme } from '../components/ThemeProvider';

const AddPlant = ({ onAddPlant, onCancel }) => {
  const [plantName, setPlantName] = useState("");
  const [plantType, setPlantType] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [notes, setNotes] = useState("");
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identificationResults, setIdentificationResults] = useState(null);
  const [plantDetails, setPlantDetails] = useState(null);
  const [error, setError] = useState(null);
  const [showMoreInfo, setShowMoreInfo] = useState(true); // Changed to true to show by default
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const webcamRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false); // Add this new state
  const { isDarkMode } = useTheme();
  const [searchMode, setSearchMode] = useState('image'); // 'image' or 'text'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Add debugging state
  const [apiResponse, setApiResponse] = useState(null);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

    setIsUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imageData = e.target.result;
        setCapturedImage(imageData);
        await identifyPlantFromImage(imageData);
      } catch (err) {
        console.error('Error processing uploaded image:', err);
        setError('Could not process the uploaded image. Please try another image or use the camera.');
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setError('Could not read the uploaded file. Please try another image.');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  // Function to handle identification logic (used by both camera and upload)
  const identifyPlantFromImage = async (imageData) => {
    try {
      setIsIdentifying(true);
      setError(null);
      
      console.log("Identifying plant from image...");
      
      // Make API call to identify the plant
      const response = await plantAPI.identifyPlant(imageData);
      
      // Store full response for debugging
      setApiResponse(response);
      console.log("Plant identification response:", response);
      
      // Process the API response
      const responseData = response.data;
      
      // Handle Plant.ID v3 API response format
      if (responseData && responseData.result && responseData.result.classification) {
        const suggestions = responseData.result.classification.suggestions;
        
        if (suggestions && suggestions.length > 0) {
          const topMatch = suggestions[0];
          setIdentificationResults(topMatch);
          
          // Extract and organize detailed plant information for v3 API
          const details = {
            scientificName: topMatch.name,
            commonName: topMatch.details?.common_names?.[0] || topMatch.name,
            allCommonNames: topMatch.details?.common_names || [],
            confidence: topMatch.probability,
            description: topMatch.details?.description || '',
            taxonomy: topMatch.details?.taxonomy || {},
            family: topMatch.details?.taxonomy?.family || 'Unknown',
            genus: topMatch.details?.taxonomy?.genus || 'Unknown',
            wikiUrl: topMatch.details?.url || ''
          };
          
          setPlantDetails(details);
          
          // Auto-fill plant name and type if available
          if (details.commonName) {
            setPlantName(details.commonName);
          }
          
          if (details.allCommonNames && details.allCommonNames.length > 0) {
            setPlantType(details.allCommonNames[0]);
          }
          
          // Add comprehensive identification info to notes
          if (details.description) {
            const careInfo = Object.entries(generateCareInfo(details))
              .map(([key, value]) => `• ${value}`)
              .join('\n');
            
            setNotes(`${details.description.substring(0, 150)}...\n\n${careInfo}`);
          }
          
          // Automatically show image preview when identification is successful
          setShowImagePreview(true);
        } else {
          setError("The plant couldn't be identified clearly. Please enter details manually or try another image.");
        }
      } else {
        setError("The plant couldn't be identified clearly. Please enter details manually or try another image.");
      }
    } catch (err) {
      console.error('Plant identification error:', err);
      let errorMessage = 'Could not identify the plant. Please enter details manually or try another image.';
      
      if (err.response) {
        console.log("Server returned error:", err.response.data);
        if (err.response.data?.error) {
          errorMessage = `API Error: ${err.response.data.error}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleCapture = async () => {
    if (!webcamRef.current) {
      setError('Camera not initialized. Please try again.');
      return;
    }

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setError('Failed to capture image. Please try again.');
        return;
      }
      
      setIsUploading(true);
      setError(null);
      setCapturedImage(imageSrc);
      setShowCamera(false); // Hide camera after capture
      await identifyPlantFromImage(imageSrc);
    } catch (err) {
      console.error('Camera capture error:', err);
      setError('Could not capture image. Please try again or upload an image instead.');
    } finally {
      setIsUploading(false);
    }
  };

  // Extract structured plant details from the API response
  const extractPlantDetails = (result) => {
    const details = {
      scientificName: result.plant_name,
      commonName: result.plant_details?.common_names?.[0] || result.plant_name,
      allCommonNames: result.plant_details?.common_names || [],
      confidence: result.probability,
      description: result.plant_details?.wiki_description?.value || '',
      taxonomy: result.plant_details?.taxonomy || {},
      family: result.plant_details?.taxonomy?.family || 'Unknown',
      genus: result.plant_details?.taxonomy?.genus || 'Unknown',
      similarImages: result.similar_images || [],
      wikiUrl: result.plant_details?.url || ''
    };
    return details;
  };

  // Generate plant care information based on plant data
  const generateCareInfo = (details) => {
    // This could be enhanced with a more sophisticated system that uses the plant's 
    // taxonomy to determine care needs, or integrate with another API
    const careInfo = {
      watering: `Most ${details.family} plants need regular watering when soil is dry to touch.`,
      light: `Many plants in the ${details.genus} genus prefer bright, indirect light.`,
      soil: `Well-draining soil mix is typically recommended for ${details.commonName}.`,
      humidity: `Monitor humidity levels based on ${details.commonName}'s natural habitat.`,
      temperature: `Ideal temperature range is typically 65-80°F (18-27°C).`,
      fertilizing: `Feed with balanced, water-soluble fertilizer during growing season.`,
      pruning: `Prune occasionally to maintain shape and remove damaged leaves.`,
      repotting: `Repot every 1-2 years or when rootbound.`,
      propagation: `Can be propagated by division or stem cuttings.`,
      toxicity: `Check specific sources for toxicity information.`,
    };
    
    return careInfo;
  };

  // Generate growing information
  const generateGrowingInfo = (details) => {
    return {
      nativeRegion: `Native to regions where ${details.genus} plants naturally grow.`,
      growthHabit: `${details.commonName} typically grows as a ${details.family.toLowerCase()} plant.`,
      matureSize: `Varies by species and growing conditions.`,
      growthRate: `Moderate growth rate in optimal conditions.`,
      lifespan: `Perennial plant with proper care.`,
      floweringSeason: `Flowering depends on species and care conditions.`,
      companionPlants: `Research companion plants suitable for your specific variety.`,
      commonProblems: `Watch for common pests like spider mites and scale insects.`,
      diseaseResistance: `Generally resistant to diseases with proper care.`
    };
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIdentificationResults(null);
    setPlantDetails(null);
    setError(null);
    setShowMoreInfo(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!plantName || !capturedImage) return;
    
    try {
      // Prepare plant data for saving to database
      const plantData = {
        name: plantName,
        species: plantDetails?.scientificName || plantType || "Unknown",
        nickname: plantName,
        mainImage: capturedImage,
        notes: notes,
        status: "Healthy",
        scientificDetails: plantDetails ? {
          scientificName: plantDetails.scientificName,
          commonNames: plantDetails.allCommonNames,
          confidence: plantDetails.confidence,
          taxonomy: plantDetails.taxonomy,
          wikiUrl: plantDetails.wikiUrl
        } : null
      };
      
      // Save to database via API
      const response = await plantAPI.createPlant(plantData);
      
      // Get the saved plant with proper MongoDB _id and pass it back
      const savedPlant = {
        id: response._id,
        name: response.name,
        species: response.species,
        nickname: response.nickname,
        image: response.mainImage,
        notes: response.notes,
        health: response.status,
        lastWatered: response.lastWatered ? new Date(response.lastWatered).toLocaleDateString() : 'Not yet watered',
        dateAdded: new Date(response.dateAdded || response.createdAt).toLocaleDateString()
      };
      
      onAddPlant(savedPlant);
    } catch (error) {
      console.error("Error saving plant to database:", error);
      setError("Failed to save plant. Please try again.");
    }
  };

  // Enhanced debugging info display
  const renderDebugInfo = () => {
    if (!apiResponse && !error) return null;
    
    return (
      <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700 overflow-auto max-h-48">
        <p className="font-bold">API Debug Information:</p>
        
        {error && (
          <div className="mt-1 border-t border-red-200 pt-1">
            <p className="font-bold text-red-600">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {apiResponse && (
          <details className="mt-1">
            <summary className="cursor-pointer text-blue-600">Show/Hide API Response</summary>
            <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(apiResponse, null, 2)}</pre>
          </details>
        )}
      </div>
    );
  };

  // Add camera toggle function
  const toggleCamera = () => {
    setShowCamera(prev => !prev);
    setError(null);
  };

  // Add this new function for text search
  const handleTextSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await plantAPI.searchPlantByName(searchQuery);
      if (response.success && response.data.suggestions) {
        const topMatch = response.data.suggestions[0];
        setPlantDetails({
          scientificName: topMatch.name,
          commonName: topMatch.details?.common_names?.[0] || topMatch.name,
          allCommonNames: topMatch.details?.common_names || [],
          description: topMatch.details?.description || '',
          taxonomy: topMatch.details?.taxonomy || {},
          family: topMatch.details?.taxonomy?.family || 'Unknown',
          genus: topMatch.details?.taxonomy?.genus || 'Unknown',
          wikiUrl: topMatch.details?.url || ''
        });
        setSearchResults(response.data.suggestions);
        
        // Auto-fill form fields
        if (topMatch.details?.common_names?.[0]) {
          setPlantName(topMatch.details.common_names[0]);
        }
      } else {
        setError("No plants found matching your search.");
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search for plants. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border dark:border-gray-700">
        {/* Header */}
        <div className="p-6 pb-3 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <button 
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Add New Plant</h2>
            <div className="w-8"></div>
          </div>
        </div>

        <div className="overflow-y-auto scrollbar-hide flex-1 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!capturedImage ? (
              <div className="space-y-4">
                {/* Add mode toggle buttons */}
                <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 mb-4">
                  <button
                    type="button"
                    onClick={() => setSearchMode('image')}
                    className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                      searchMode === 'image'
                        ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <Camera size={18} className="inline mr-2" />
                    Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchMode('text')}
                    className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                      searchMode === 'text'
                        ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <Search size={18} className="inline mr-2" />
                    Text
                  </button>
                </div>

                {searchMode === 'text' ? (
                  // Text search interface
                  <div className="space-y-4">
                    <div className="relative">
                      <form onSubmit={handleTextSearch} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Search plant by name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-500/50 outline-none transition-all text-gray-900 dark:text-gray-100"
                        />
                        <button
                          type="submit"
                          disabled={isSearching || !searchQuery.trim()}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {isSearching ? (
                            <Loader size={20} className="animate-spin" />
                          ) : (
                            <Search size={20} />
                          )}
                        </button>
                      </form>

                      {/* Search Results */}
                      {searchResults.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {searchResults.map((result, index) => (
                            <div
                              key={index}
                              className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                              onClick={() => {
                                setPlantName(result.details?.common_names?.[0] || result.name);
                                setPlantType(result.name);
                                setPlantDetails({
                                  scientificName: result.name,
                                  commonName: result.details?.common_names?.[0] || result.name,
                                  // ...other details
                                });
                              }}
                            >
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {result.details?.common_names?.[0] || result.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                {result.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Existing image capture/upload interface
                  <div className="relative h-80 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border dark:border-gray-700">
                    {showCamera ? (
                      // Camera View
                      <div className="relative h-full">
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          className="absolute inset-0 w-full h-full object-cover"
                          videoConstraints={{ 
                            facingMode: 'environment',
                            width: 1280,
                            height: 720,
                          }}
                        />
                        <div className="absolute bottom-4 inset-x-0 flex justify-center space-x-4">
                          <button
                            type="button"
                            onClick={handleCapture}
                            disabled={isUploading}
                            className="bg-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors flex items-center"
                          >
                            <Camera size={20} className="text-gray-700 mr-2" />
                            Capture
                          </button>
                          <button
                            type="button"
                            onClick={toggleCamera}
                            className="bg-gray-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Initial View with buttons
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
                        <div className="flex flex-col items-center mb-6">
                          <Camera size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
                          <p className="text-gray-600 dark:text-gray-300 text-center mb-8 px-4">
                            Take a photo or upload an image of your plant
                          </p>
                        </div>

                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={toggleCamera}
                            className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center"
                          >
                            <Camera size={20} className="mr-2" />
                            Take Photo
                          </button>

                          <label className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-full shadow-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center cursor-pointer border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200">
                            <Upload size={20} className="mr-2" />
                            Upload Image
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileUpload}
                              disabled={isUploading}
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Loading overlay */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent mb-2"></div>
                          <p className="text-gray-100">Processing image...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                    <button
                      type="button"
                      onClick={handleRetake}
                      className="ml-2 underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {isIdentifying ? (
                  <div className="h-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent mb-2"></div>
                      <p className="text-gray-600">Identifying plant...</p>
                    </div>
                  </div>
                ) : (
                  plantDetails && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-800">Plant Identified!</h3>
                      <p className="text-sm text-green-600">
                        {plantDetails.commonName} ({plantDetails.scientificName})
                      </p>
                    </div>
                  )
                )}

                <button
                  type="button"
                  onClick={handleRetake}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Take another photo
                </button>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Plant Name*
                </label>
                <input
                  type="text"
                  placeholder="E.g., Peace Lily"
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-500/50 outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Plant Type
                </label>
                <input
                  type="text"
                  placeholder="E.g., Indoor/Flowering"
                  value={plantType}
                  onChange={(e) => setPlantType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-500/50 outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Notes
                </label>
                <textarea
                  placeholder="Add any care instructions or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-500/50 outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!capturedImage || !plantName || isIdentifying}
                className={`flex-1 bg-green-600 text-white px-4 py-3 rounded-lg transition-colors shadow-sm font-medium flex items-center justify-center ${
                  !capturedImage || !plantName || isIdentifying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                }`}
              >
                {isIdentifying ? (
                  <>
                    <Loader size={18} className="animate-spin mr-1.5" /> Processing...
                  </>
                ) : (
                  <>
                    <Check size={18} className="mr-1.5" /> Save Plant
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPlant;