const { admin, auth, firestore, storage, messaging } = require('../config/firebase');

/**
 * Send push notification to a user's device
 * @param {string} token - FCM device token
 * @param {object} notification - Notification payload
 * @param {object} data - Optional data payload
 */
exports.sendPushNotification = async (token, notification, data = {}) => {
  try {
    const message = {
      token,
      notification,
      data
    };
    
    const response = await messaging.send(message);
    console.log('Push notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

/**
 * Upload a file to Firebase Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filePath - Path where file should be stored
 * @param {object} metadata - File metadata
 */
exports.uploadFile = async (fileBuffer, filePath, metadata = {}) => {
  try {
    const bucket = storage.bucket();
    const file = bucket.file(filePath);
    
    await file.save(fileBuffer, {
      metadata: {
        contentType: metadata.contentType,
        ...metadata
      }
    });
    
    // Make file publicly accessible
    await file.makePublic();
    
    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    throw error;
  }
};

/**
 * Verify a Firebase ID token
 * @param {string} idToken - Firebase ID token
 */
exports.verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    throw error;
  }
};
