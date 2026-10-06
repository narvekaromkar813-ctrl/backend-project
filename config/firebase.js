const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let firebaseApp = null;
let isInitialized = false;

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (serviceAccountPath) {
  const resolvedPath = path.isAbsolute(serviceAccountPath)
    ? serviceAccountPath
    : path.join(__dirname, "..", serviceAccountPath);

  if (fs.existsSync(resolvedPath)) {
    try {
      const serviceAccount = require(resolvedPath);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      isInitialized = true;
      console.log("[Firebase] Admin SDK initialized successfully with service account.");
    } catch (error) {
      console.warn("[Firebase] Failed to initialize Firebase Admin SDK:", error.message);
    }
  } else {
    console.warn(`[Firebase] Service account file not found at: ${resolvedPath}. Running in Mock/Fallback mode.`);
  }
} else {
  // Graceful fallback mode
  // console.log("[Firebase] FIREBASE_SERVICE_ACCOUNT_PATH not set. Push notifications will run in Mock Mode.");
}

/**
 * Send push notification via Firebase Admin FCM or fallback mock
 * @param {object} options
 * @param {string} options.token - FCM device token
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {object} [options.data] - Custom key-value pairs
 */
async function sendPushNotification({ token, title, body, data = {} }) {
  if (isInitialized && firebaseApp && token) {
    try {
      const message = {
        token,
        notification: { title, body },
        data: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v)])
        )
      };
      const response = await admin.messaging().send(message);
      return { success: true, mode: "firebase", response };
    } catch (err) {
      console.error("[Firebase] Push notification delivery failed:", err.message);
      return { success: false, mode: "firebase", error: err.message };
    }
  }

  // Graceful Mock Delivery (useful for development & testing without requiring actual Google Cloud account)
  console.log(`[Firebase Mock Notification] -> Title: "${title}" | Body: "${body}" | Device Token: ${token || "broadcast"}`);
  return {
    success: true,
    mode: "mock",
    message: "Notification logged via Mock Mode (configure FIREBASE_SERVICE_ACCOUNT_PATH for live FCM delivery)",
    payload: { title, body, data }
  };
}

module.exports = {
  admin,
  firebaseApp,
  isInitialized,
  sendPushNotification
};
