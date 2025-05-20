import React, { useState, useRef } from 'react';
import { User, Mail, Camera, Edit2, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import LogoOJT from '../assets/LogoOJT.png';
import defaultProfile from '../assets/profile.png';
import Webcam from 'react-webcam';

const Profile = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('Profile');
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: defaultProfile,  // Set default profile image
    joinDate: '2024-01-01',
    totalPlants: 12,
    activeReminders: 5
  });

  const [editForm, setEditForm] = useState({ ...userProfile });
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setUserProfile(editForm);
    setIsEditing(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfile({ ...userProfile, avatar: reader.result });
        setShowImageModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setUserProfile({ ...userProfile, avatar: imageSrc });
      setShowCamera(false);
      setShowImageModal(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
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
              <img 
                src={LogoOJT} 
                alt="Sprouty Logo" 
                className="h-17 w-16 mr-4"
              />
              <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
            </div>
          </div>

          {/* Profile Content */}
          <div className="grid gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <img 
                    src={userProfile.avatar}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-green-100"
                  />
                  <button 
                    onClick={() => setShowImageModal(true)}
                    className="absolute bottom-0 right-0 bg-green-500 p-2 rounded-full text-white hover:bg-green-600 transition-colors"
                  >
                    <Camera size={20} />
                  </button>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">{userProfile.name}</h2>
                      <p className="text-gray-600 flex items-center mt-1">
                        <Mail size={16} className="mr-2" />
                        {userProfile.email}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Member since {new Date(userProfile.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600 transition-colors"
                    >
                      <Edit2 size={16} className="mr-2" />
                      Edit Profile
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-sm text-green-600 font-medium">Total Plants</h3>
                      <p className="text-2xl font-bold text-green-700">{userProfile.totalPlants}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-sm text-blue-600 font-medium">Active Reminders</h3>
                      <p className="text-2xl font-bold text-blue-700">{userProfile.activeReminders}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Edit Profile</h3>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                  >
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Image Upload Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Update Profile Picture</h3>
                <button 
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

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
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                      >
                        <Camera size={20} className="inline mr-2" />
                        Capture
                      </button>
                      <button
                        onClick={() => setShowCamera(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowCamera(true)}
                      className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center"
                    >
                      <Camera size={20} className="mr-2" />
                      Take Photo
                    </button>
                    
                    <div className="relative">
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 flex items-center justify-center"
                      >
                        <Upload size={20} className="mr-2" />
                        Upload Image
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
