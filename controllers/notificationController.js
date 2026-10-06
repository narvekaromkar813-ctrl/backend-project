const { sendPushNotification } = require("../config/firebase");
const { emitAlert } = require("../config/socket");
const Alert = require("../models/Alert");

// POST /api/notifications/send - Send push/realtime notification
const sendNotification = async (req, res) => {
  try {
    const { title, body, panelId, severity = "medium", type = "maintenance_due", fcmToken } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "Notification title and body are required"
      });
    }

    // 1. Create in-app alert record
    const alert = await Alert.create({
      user: req.user._id,
      panel: panelId || null,
      title: title.trim(),
      message: body.trim(),
      severity,
      type
    });

    // 2. Broadcast via Socket.IO
    emitAlert(req.user._id.toString(), {
      alertId: alert._id,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      type: alert.type,
      createdAt: alert.createdAt
    });

    // 3. Dispatch Firebase push notification
    const token = fcmToken || req.user.fcmToken;
    const pushResult = await sendPushNotification({
      token,
      title,
      body,
      data: {
        alertId: String(alert._id),
        severity
      }
    });

    res.status(200).json({
      success: true,
      message: "Notification dispatched successfully",
      channels: {
        socketIo: "Emitted to real-time subscribers",
        firebaseFcm: pushResult
      },
      alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending notification: " + error.message
    });
  }
};

module.exports = {
  sendNotification
};
