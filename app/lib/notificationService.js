import admin from './firebaseAdmin.js';

/**
 * Sends a push notification to a specific device.
 *
 * @param {string} fcmToken The FCM registration token of the device.
 * @param {string} title The title of the notification.
 * @param {string} body The body of the notification.
 * @param {object} data The data payload to send with the notification, used for navigation.
 */
export async function sendPushNotification(fcmToken, title, body, data) {
  if (!fcmToken) {
    console.error('Attempted to send notification but FCM token was missing.');
    return;
  }

  const message = {
    token: fcmToken,
    notification: {
      title,
      body,
    },
    data,
    apns: {
      payload: {
        aps: {
          'content-available': 1,
          sound: 'default',
        },
      },
    },
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channel_id: 'dork_pms_alert_channel', // Ensure this channel is created on the client
      },
    },
  };

  try {
    await admin.messaging().send(message);
    console.log(`Successfully sent message to token: ${fcmToken}`);
  } catch (error) {
    console.error('Error sending push notification:', error);
    // Here you might want to handle invalid tokens, e.g., by removing them from the database
    if (error.code === 'messaging/registration-token-not-registered') {
      console.log(`Token ${fcmToken} is not registered. It should be removed.`);
      // TODO: Add logic to remove the invalid token from the database.
    }
  }
}
