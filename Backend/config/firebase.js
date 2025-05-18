const admin = require('firebase-admin');
const path = require('path');

// Path to service account file
const serviceAccount = require('./serviceaccounct.json'); // Fixed spelling to match actual filename

// Initialize Firebase Admin
const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET
});

// Export Firebase services
module.exports = {
  admin: firebaseAdmin,
  auth: firebaseAdmin.auth(),
  firestore: firebaseAdmin.firestore(),
  storage: firebaseAdmin.storage(),
  messaging: firebaseAdmin.messaging()
};
