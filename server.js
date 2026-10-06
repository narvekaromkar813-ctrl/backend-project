require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Create HTTP server instance
    const server = http.createServer(app);

    // 3. Initialize WebSockets (Socket.IO)
    initSocket(server);

    // 4. Start HTTP and WebSocket listener
    server.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`☀️  SolarSight Server running at http://localhost:${PORT}`);
      console.log(`📄  API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`⚡  Socket.IO real-time engine ready on port ${PORT}`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error("Critical server startup failure:", error.message);
    process.exit(1);
  }
}

startServer();