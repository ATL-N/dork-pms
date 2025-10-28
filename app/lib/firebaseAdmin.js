import admin from 'firebase-admin';

// IMPORTANT: Replace this with the actual path to your Firebase service account key file.
// You can download this file from your Firebase project settings. dork-pms-firebase-adminsdk-fbsvc-c15f40f223.json
const serviceAccount = require('../../dork-pms-firebase-adminsdk-fbsvc-c15f40f223.json');

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
}

export default admin;
