const fs = require('fs');
const path = require('path');
const { verifyGoogleToken } = require('../config/firebase');

/**
 * Verify Google OAuth token
 * @param {string} idToken - Google ID token
 */
exports.verifyGoogleIdToken = async (idToken) => {
  try {
    const userInfo = await verifyGoogleToken(idToken);
    return userInfo;
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    throw error;
  }
};

/**
 * Upload a file to local storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filePath - Path where file should be stored
 * @param {object} metadata - File metadata
 */
exports.uploadFile = async (fileBuffer, filePath, metadata = {}) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    const fullPath = path.join(uploadsDir, filePath);
    
    // Ensure directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write file to local storage
    fs.writeFileSync(fullPath, fileBuffer);
    
    // Return local URL path
    const publicUrl = `/uploads/${filePath}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to local storage:', error);
    throw error;
  }
};
