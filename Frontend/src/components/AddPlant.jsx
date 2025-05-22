import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, ArrowLeft, Loader, Info, Maximize, Droplets, Sun, Wind, Thermometer, 
         Globe, Leaf, Bookmark, FlowerIcon, Calendar, Upload, Image } from 'lucide-react';
import Webcam from 'react-webcam';
import { plantAPI } from '../services/api';

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

  // Add debugging state
  const [apiResponse, setApiResponse] = useState(null);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imageData = e.target.result;
        setCapturedImage(imageData);
        
        // Now identify the plant using the uploaded image
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
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      
      // Start plant identification process
      await identifyPlantFromImage(imageSrc);
    } catch (err) {
      console.error('Camera capture error:', err);
      setError('Could not capture image. Please try again or upload an image instead.');
      setIsIdentifying(false);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 pb-3">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800">Add New Plant</h2>
            <div className="w-8"></div>
          </div>
        </div>

        <div className="overflow-y-auto scrollbar-hide flex-1 px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!capturedImage ? (
              <div className="relative">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full rounded-lg shadow-md mb-4 aspect-[4/3] object-cover"
                  videoConstraints={{facingMode: 'environment'}}
                />
                
                {/* Camera controls with added upload button */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={handleCapture}
                    className="bg-white p-4 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                    disabled={isUploading}
                  >
                    <Camera size={24} className="text-sprouty-green-600" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="bg-white p-4 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                    disabled={isIdentifying}
                  >
                    <Upload size={24} className="text-blue-600" />
                  </button>
                  
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                
                {/* Upload indicator */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="text-center text-white">
                      <Loader size={32} className="mx-auto animate-spin mb-2" />
                      <p>Processing image...</p>
                    </div>
                  </div>
                )}
                
                {/* File upload zone for drag and drop */}
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-30 rounded-lg"
                  onClick={() => fileInputRef.current.click()}
                >
                  <Image size={42} className="text-white mb-2 opacity-80" />
                  <p className="text-white text-sm font-medium text-center">
                    Click or drag and drop<br />to upload a plant image
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="group relative">
                  <img 
                    src={capturedImage} 
                    alt="Captured plant" 
                    className="w-full h-64 object-cover rounded-lg shadow-md cursor-pointer" 
                    onClick={() => setShowImagePreview(true)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                    <button
                      type="button"
                      onClick={() => setShowImagePreview(true)}
                      className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Maximize size={20} className="text-gray-700" />
                    </button>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleRetake}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 p-1.5 rounded-full hover:bg-opacity-70 transition-colors"
                >
                  <X size={18} className="text-white" />
                </button>
                
                {isIdentifying && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="text-center text-white">
                      <Loader size={32} className="mx-auto animate-spin mb-2" />
                      <p>Identifying plant...</p>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="mt-2 text-red-600 text-sm bg-red-50 p-2 rounded-md">
                    {error}
                  </div>
                )}
                
                {/* Uncomment this for debugging */}
                {/* {renderDebugInfo()} */}
                
                {plantDetails && (
                  <div className="mt-2 bg-green-50 p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <p className="text-green-800 text-sm font-medium">
                        Identified as <span className="italic">{plantDetails.scientificName}</span> ({(plantDetails.confidence * 100).toFixed(1)}% confidence)
                      </p>
                      {/* No need for an info button since we're showing details by default */}
                    </div>
                    
                    <div className="mt-2 border-t border-green-200 pt-2">
                      {/* Tabs for plant information */}
                      <div className="flex border-b border-green-200 mb-2">
                        <button 
                          type="button"
                          className={`px-3 py-2 text-xs font-medium ${activeTab === 'overview' ? 'border-b-2 border-green-600 text-green-800' : 'text-gray-600'}`}
                          onClick={() => setActiveTab('overview')}
                        >
                          Overview
                        </button>
                        <button 
                          type="button"
                          className={`px-3 py-2 text-xs font-medium ${activeTab === 'care' ? 'border-b-2 border-green-600 text-green-800' : 'text-gray-600'}`}
                          onClick={() => setActiveTab('care')}
                        >
                          Care Tips
                        </button>
                        <button 
                          type="button"
                          className={`px-3 py-2 text-xs font-medium ${activeTab === 'growing' ? 'border-b-2 border-green-600 text-green-800' : 'text-gray-600'}`}
                          onClick={() => setActiveTab('growing')}
                        >
                          Growing Info
                        </button>
                      </div>
                      
                      {/* Tab content */}
                      <div className="text-sm">
                        {activeTab === 'overview' && (
                          <div>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div>
                                <p className="font-medium text-green-800">Common Name</p>
                                <p>{plantDetails.commonName}</p>
                              </div>
                              <div>
                                <p className="font-medium text-green-800">Family</p>
                                <p>{plantDetails.family}</p>
                              </div>
                              <div>
                                <p className="font-medium text-green-800">Genus</p>
                                <p>{plantDetails.genus}</p>
                              </div>
                              <div>
                                <p className="font-medium text-green-800">Confidence</p>
                                <p>{(plantDetails.confidence * 100).toFixed(1)}%</p>
                              </div>
                            </div>
                            
                            {plantDetails.description && (
                              <div className="mt-1">
                                <p className="font-medium text-green-800">Description</p>
                                <p className="text-gray-700">{plantDetails.description.substring(0, 150)}...</p>
                              </div>
                            )}
                            
                            {plantDetails.wikiUrl && (
                              <a 
                                href={plantDetails.wikiUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline inline-block mt-2"
                              >
                                Read more on Wikipedia
                              </a>
                            )}
                          </div>
                        )}
                        
                        {activeTab === 'care' && (
                          <div className="space-y-2">
                            {Object.entries(generateCareInfo(plantDetails)).map(([key, value]) => (
                              <div key={key} className="flex items-start">
                                {key === 'watering' && <Droplets size={16} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />}
                                {key === 'light' && <Sun size={16} className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />}
                                {key === 'soil' && <Globe size={16} className="text-brown-500 mt-0.5 mr-2 flex-shrink-0" />}
                                {key === 'humidity' && <Wind size={16} className="text-blue-400 mt-0.5 mr-2 flex-shrink-0" />}
                                {key === 'temperature' && <Thermometer size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />}
                                {key === 'fertilizing' && <Leaf size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />}
                                {key === 'pruning' && <Leaf size={16} className="text-green-600 mt-0.5 mr-2 flex-shrink-0" />}
                                {key === 'repotting' && <FlowerIcon size={16} className="text-green-700 mt-0.5 mr-2 flex-shrink-0" />}
                                {key === 'propagation' && <Bookmark size={16} className="text-green-800 mt-0.5 mr-2 flex-shrink-0" />}
                                {key === 'toxicity' && <Info size={16} className="text-red-600 mt-0.5 mr-2 flex-shrink-0" />}
                                <p>{value}</p>
                              </div>
                            ))}
                            <p className="text-xs text-gray-500 mt-2">Note: These care tips are general recommendations. Research specific needs for your exact plant species.</p>
                          </div>
                        )}
                        
                        {activeTab === 'growing' && (
                          <div className="space-y-2">
                            {Object.entries(generateGrowingInfo(plantDetails)).map(([key, value]) => (
                              <div key={key} className="flex items-start">
                                <Calendar size={16} className="text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                                <p>{value}</p>
                              </div>
                            ))}
                            <p className="text-xs text-gray-500 mt-2">Note: Growing information may vary by specific variety and local conditions.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plant Name*</label>
                <input
                  type="text"
                  placeholder="E.g., Peace Lily"
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg shadow-sm border focus:ring-2 focus:ring-sprouty-green-200 outline-none transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plant Type</label>
                <input
                  type="text"
                  placeholder="E.g., Indoor/Flowering"
                  value={plantType}
                  onChange={(e) => setPlantType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg shadow-sm border focus:ring-2 focus:ring-sprouty-green-200 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  placeholder="Add any care instructions or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2.5 rounded-lg shadow-sm border focus:ring-2 focus:ring-sprouty-green-200 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!capturedImage || !plantName || isIdentifying}
                className={`flex-1 bg-sprouty-green-500 text-white px-4 py-3 rounded-lg transition-colors shadow-sm font-medium flex items-center justify-center ${
                  !capturedImage || !plantName || isIdentifying ? 'opacity-60 cursor-not-allowed' : 'hover:bg-sprouty-green-600'
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

      {/* Fullscreen image preview modal */}
      {showImagePreview && capturedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center animate-fadeIn"
          onClick={() => setShowImagePreview(false)}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowImagePreview(false)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition-colors z-10"
            >
              <X size={24} className="text-white" />
            </button>
            
            <div className="relative w-[90%] h-[80%] flex items-center justify-center">
              <img 
                src={capturedImage} 
                alt="Plant preview" 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
            
            {plantDetails && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
                <p className="text-xl font-semibold">{plantDetails.commonName || plantName}</p>
                <p className="text-sm italic">{plantDetails.scientificName}</p>
                
                {/* Add a button to view plant details */}
                <button
                  onClick={() => setShowImagePreview(false)}
                  className="mt-2 bg-sprouty-green-600 hover:bg-sprouty-green-700 text-white px-4 py-2 rounded-full text-sm transition-colors"
                >
                  View Plant Details
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Uncomment the debug info during development */}
      {isIdentifying && <div className="fixed bottom-4 right-4 bg-white p-2 rounded-md shadow-md text-xs">
        Processing plant image...
      </div>}
    </div>
  );
};

export default AddPlant;