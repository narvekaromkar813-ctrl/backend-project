const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// Route imports
const authRoutes = require("./routes/authRoutes");
const panelRoutes = require("./routes/panelRoutes");
const generationRoutes = require("./routes/generationRoutes");
const consumptionRoutes = require("./routes/consumptionRoutes");
const gridRoutes = require("./routes/gridRoutes");
const billRoutes = require("./routes/billRoutes");
const alertRoutes = require("./routes/alertRoutes");
const roiRoutes = require("./routes/roiRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const compareRoutes = require("./routes/compareRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const advancedRoutes = require("./routes/advancedRoutes");

// Error handling middleware
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Security and utility middleware
app.use(helmet({ contentSecurityPolicy: false })); // allow swagger ui inline assets
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "SolarSight API Documentation",
  customCss: ".swagger-ui .topbar { background-color: #0d2137; }"
}));

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "SolarSight — Solar Panel Monitoring System API",
    version: "1.0.0",
    status: "online",
    documentation: "/api-docs",
    healthCheck: "/api/health",
    supportedEndpoints: [
      "/api/auth",
      "/api/panels",
      "/api/generation",
      "/api/consumption",
      "/api/grid",
      "/api/bills",
      "/api/alerts",
      "/api/roi",
      "/api/weather",
      "/api/compare",
      "/api/notifications",
      "/api/advanced"
    ]
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "SolarSight Backend",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/panels", panelRoutes);
app.use("/api/generation", generationRoutes);
app.use("/api/consumption", consumptionRoutes);
app.use("/api/grid", gridRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/roi", roiRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/compare", compareRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/advanced", advancedRoutes);

// Catch 404 and forward to error handler
app.use(notFound);

// Central error handler
app.use(errorHandler);

module.exports = app;