const { emitAlert } = require("../config/socket");
const { sendPushNotification } = require("../config/firebase");
const Alert = require("../models/Alert");
const User = require("../models/User");

/**
 * Dispatch an alert to both MongoDB, Socket.io, and Firebase push notifications
 * @param {object} params
 * @param {string} params.userId
 * @param {string} [params.panelId]
 * @param {string} params.type
 * @param {string} params.severity - low | medium | high | critical
 * @param {string} params.title
 * @param {string} params.message
 */
async function dispatchAlert({ userId, panelId = null, type, severity, title, message }) {
  // 1. Persist alert in MongoDB
  const alert = await Alert.create({
    user: userId,
    panel: panelId || null,
    type: type || "general",
    severity: severity || "medium",
    title,
    message
  });

  // 2. Broadcast via Socket.IO for real-time dashboard listeners
  try {
    emitAlert(userId, {
      alertId: alert._id,
      userId,
      panelId,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      createdAt: alert.createdAt
    });
  } catch (socketErr) {
    console.warn("[NotificationService] Socket.io emission failed:", socketErr.message);
  }

  // 3. Dispatch Firebase Push Notification if user has an FCM token
  let fcmResult = null;
  try {
    const user = await User.findById(userId).select("fcmToken");
    if (user && user.fcmToken) {
      fcmResult = await sendPushNotification({
        token: user.fcmToken,
        title: `[SolarSight Alert] ${title}`,
        body: message,
        data: {
          alertId: String(alert._id),
          severity: alert.severity,
          panelId: panelId ? String(panelId) : ""
        }
      });
    } else {
      // Mock log for simulation
      fcmResult = await sendPushNotification({
        token: null,
        title: `[SolarSight Alert] ${title}`,
        body: message,
        data: { alertId: String(alert._id) }
      });
    }
  } catch (fcmErr) {
    console.warn("[NotificationService] FCM notification failed:", fcmErr.message);
  }

  return { alert, fcmResult };
}

module.exports = {
  dispatchAlert
};
