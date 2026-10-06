const { Server } = require("socket.io");

let io = null;

/**
 * Initialize Socket.io instance with the HTTP server
 * @param {import('http').Server} server 
 */
function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Allow clients to join user-specific or panel-specific rooms
    socket.on("join-user", (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket.io] Socket ${socket.id} joined user:${userId}`);
      }
    });

    socket.on("join-panel", (panelId) => {
      if (panelId) {
        socket.join(`panel:${panelId}`);
        console.log(`[Socket.io] Socket ${socket.id} joined panel:${panelId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Retrieve the active Socket.io instance
 * @returns {Server}
 */
function getIO() {
  if (!io) {
    console.warn("[Socket.io] Instance requested before initialization.");
  }
  return io;
}

/**
 * Emit real-time generation update
 * @param {string} [userId]
 * @param {object} data
 */
function emitGenerationUpdate(userId, data) {
  if (!io) return;
  // Broadcast to global topic
  io.emit("generation:update", data);
  // Also send to user room if provided
  if (userId) {
    io.to(`user:${userId}`).emit("generation:update", data);
  }
}

/**
 * Emit real-time alert notification
 * @param {string} [userId]
 * @param {object} alert
 */
function emitAlert(userId, alert) {
  if (!io) return;
  io.emit("alert:new", alert);
  if (userId) {
    io.to(`user:${userId}`).emit("alert:new", alert);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitGenerationUpdate,
  emitAlert
};
