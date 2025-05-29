import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, X, Edit2, Save, Mail, MapPin, Calendar, Leaf, User, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { userAPI, uploadToCloudinary } from '../services/api';
import Webcam from 'react-webcam';

const Profile = () => {
  const defaultProfile = "https://via.placeholder.com/150x150/e5e7eb/6b7280?text=User";
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('Profile');
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    avatar: '',
    location: '',
    joinDate: '',
    totalPlants: 0,
    activeReminders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  });
  const [saving, setSaving] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [activities] = useState([
    {
      icon: <Leaf className="text-green-500" size={16} />,
      text: "Added new plant: Monstera Deliciosa",
      time: "2 hours ago"
    },
    {
      icon: <Calendar className="text-blue-500" size={16} />,
      text: "Watered Peace Lily",
      time: "1 day ago"
    },
    {
      icon: <User className="text-purple-500" size={16} />,
      text: "Updated profile information",
      time: "3 days ago"
    }
  ]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await userAPI.getProfile();
      if (response.success) {
        const profileData = {
          name: response.data.name || userData.name || '',
          email: response.data.email || userData.email || '',
          avatar: response.data.avatar || userData.avatar || '',
          location: response.data.location || '',
          joinDate: response.data.createdAt ? new Date(response.data.createdAt).toLocaleDateString() : 'Recently',
          totalPlants: response.data.totalPlants || 0,
          activeReminders: response.data.activeReminders || 0
        };
        
        setUserProfile(profileData);
        setEditForm({
          name: profileData.name,
          email: profileData.email
        });
      } else {
        // Fallback to localStorage data
        setUserProfile({
          name: userData.name || 'User',
          email: userData.email || '',
          avatar: userData.avatar || '',
          location: '',
          joinDate: 'Recently',
          totalPlants: 0,
          activeReminders: 0
        });
        setEditForm({
          name: userData.name || '',
          email: userData.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await userAPI.updateProfile(editForm);
      if (response.success) {
        setUserProfile(prev => ({
          ...prev,
          name: editForm.name,
          email: editForm.email
        }));
        setIsEditing(false);
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageData = e.target.result;
          const response = await userAPI.updateProfile({ avatar: imageData });
          
          if (response.success) {
            setUserProfile(prev => ({ ...prev, avatar: imageData }));
            setShowImageModal(false);
          } else {
            throw new Error(response.error || 'Failed to update profile picture');
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setSaving(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setError('Failed to process image');
      setSaving(false);
    }
  };

  const handleCameraCapture = async () => {
    if (!webcamRef.current) return;

    setSaving(true);
    setError(null);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const response = await userAPI.updateProfile({ avatar: imageSrc });
        
        if (response.success) {
          setUserProfile(prev => ({ ...prev, avatar: imageSrc }));
          setShowImageModal(false);
          setShowCamera(false);
        } else {
          throw new Error(response.error || 'Failed to update profile picture');
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar 
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          activeNavItem={activeNavItem}
          setActiveNavItem={setActiveNavItem}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        activeNavItem={activeNavItem}
        setActiveNavItem={setActiveNavItem}
      />

      <div className="flex-1 overflow-y-auto">
        {/* Profile Header/Cover */}
        <div className="relative h-64 bg-gradient-to-r from-green-400 to-emerald-600 dark:from-green-800 dark:to-emerald-900">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-end space-x-6">
              <div className="relative">
                <img 
                  src={userProfile.avatar || defaultProfile}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white"
                  onError={(e) => {
                    e.target.src = defaultProfile;
                  }}
                />
                <button 
                  onClick={() => setShowImageModal(true)}
                  className="absolute bottom-0 right-0 bg-green-500 p-2 rounded-full text-white hover:bg-green-600 transition-colors"
                >
                  <Camera size={20} />
                </button>
              </div>
              <div className="mb-2">
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl font-bold">{userProfile.name}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center text-sm backdrop-blur-sm transition-colors"
                  >
                    <Edit2 size={16} className="mr-2" /> Edit Profile
                  </button>
                </div>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="flex items-center text-sm">
                    <Mail size={16} className="mr-1" /> {userProfile.email}
                  </span>
                  {userProfile.location && (
                    <span className="flex items-center text-sm">
                      <MapPin size={16} className="mr-1" /> {userProfile.location}
                    </span>
                  )}
                  <span className="flex items-center text-sm">
                    <Calendar size={16} className="mr-1" /> Joined {userProfile.joinDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="grid gap-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Plants</h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{userProfile.totalPlants}</p>
                  <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">plants</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Reminders</h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{userProfile.activeReminders}</p>
                  <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">reminders</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-3 text-sm p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <div className="p-2 rounded-full bg-gray-50 dark:bg-gray-700">
                      {activity.icon}
                    </div>
                    <span className="flex-1 text-gray-700 dark:text-gray-300">{activity.text}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs">{activity.time}</span>
                  </div>
                ))}
              </div>
              {activities.length > 4 && (
                <button className="w-full mt-4 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
                  View All Activities
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold dark:text-white">Edit Profile</h3>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      name: userProfile.name,
                      email: userProfile.email
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-gray-100 dark:bg-gray-600 dark:text-gray-300"
                      disabled
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        name: userProfile.name,
                        email: userProfile.email
                      });
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold dark:text-white">Update Profile Picture</h3>
                <button 
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={saving}
                >
                  <X size={20} />
                </button>
              </div>

              {saving && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <p className="text-blue-600 dark:text-blue-400 text-sm">Saving profile picture...</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {showCamera ? (
                  <div className="space-y-4">
                    <Webcam
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="w-full rounded-lg"
                    />
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={handleCameraCapture}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                        disabled={saving}
                      >
                        <Camera size={20} className="inline mr-2" />
                        Capture & Save
                      </button>
                      <button
                        onClick={() => setShowCamera(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50"
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowCamera(true)}
                      className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center disabled:opacity-50"
                      disabled={saving}
                    >
                      <Camera size={20} className="mr-2" />
                      Take Photo
                    </button>
                    
                    <div className="relative">
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 flex items-center justify-center disabled:opacity-50"
                        disabled={saving}
                      >
                        <Upload size={20} className="mr-2" />
                        Upload & Save Image
                      </button>
                                          <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                            className="hidden"
                                          />
                                        </div>
                                          
                                          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Supported formats: JPG, PNG, GIF (max 5MB)
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {error && (
                                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      };
                      
                      export default Profile;
