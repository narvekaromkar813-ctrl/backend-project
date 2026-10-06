const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SolarSight — Solar Panel Monitoring System API",
      version: "1.0.0",
      description:
        "Comprehensive REST API backend for monitoring solar generation, electricity consumption, grid import/export, electricity bills, ROI savings, alerts, weather forecasts, and peer comparisons.\n\nDeveloped for ITM Skills University Case Study 59.",
      contact: {
        name: "SolarSight Engineering Team",
        email: "support@solarsight.local"
      }
    },
    servers: [
      {
        url: "http://localhost:5001",
        description: "Local Development Server"
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token obtained from /api/auth/login"
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", example: "Omkar Narvekar" },
            email: { type: "string", example: "omkar@example.com" },
            role: { type: "string", enum: ["user", "admin"], example: "user" },
            location: {
              type: "object",
              properties: {
                city: { type: "string", example: "Mumbai" },
                state: { type: "string", example: "Maharashtra" },
                latitude: { type: "number", example: 19.076 },
                longitude: { type: "number", example: 72.8777 }
              }
            },
            installedCapacity: { type: "number", example: 5.0, description: "Total installed solar capacity in kW" },
            electricityTariff: { type: "number", example: 7.50, description: "Grid tariff in ₹/kWh" }
          }
        },
        Panel: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "Rooftop Array 1" },
            capacity: { type: "number", example: 5.0, description: "Capacity in kW" },
            panelType: { type: "string", example: "Monocrystalline" },
            installationDate: { type: "string", format: "date", example: "2024-01-15" },
            location: { type: "string", example: "Main Terrace North-East" },
            status: { type: "string", enum: ["active", "maintenance", "inactive"], example: "active" },
            cost: { type: "number", example: 250000, description: "Total installation cost in ₹" },
            efficiency: { type: "number", example: 21.5, description: "Efficiency percentage %" }
          }
        },
        Generation: {
          type: "object",
          properties: {
            _id: { type: "string" },
            panel: { type: "string", description: "Panel ID" },
            powerOutput: { type: "number", example: 4.8, description: "Instantaneous power in kW" },
            energyGenerated: { type: "number", example: 18.2, description: "Energy generated today/interval in kWh" },
            timestamp: { type: "string", format: "date-time" },
            temperature: { type: "number", example: 32.5 },
            irradiance: { type: "number", example: 850 }
          }
        },
        Consumption: {
          type: "object",
          properties: {
            _id: { type: "string" },
            powerConsumed: { type: "number", example: 3.2, description: "Instantaneous power consumed in kW" },
            energyConsumed: { type: "number", example: 12.0, description: "Energy consumed today in kWh" },
            applianceCategory: { type: "string", example: "general" },
            timestamp: { type: "string", format: "date-time" }
          }
        },
        Alert: {
          type: "object",
          properties: {
            _id: { type: "string" },
            type: { type: "string", example: "underperformance" },
            severity: { type: "string", enum: ["low", "medium", "high", "critical"], example: "medium" },
            title: { type: "string", example: "Panel #3 Underperforming" },
            message: { type: "string", example: "Panel #3 underperforming 8%, cleaning due" },
            isRead: { type: "boolean", example: false },
            isResolved: { type: "boolean", example: false }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
