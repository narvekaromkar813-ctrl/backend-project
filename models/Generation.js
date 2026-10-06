const mongoose = require("mongoose");

const generationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true
    },

    panel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Panel",
      required: [true, "Panel ID is required"],
      index: true
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },

    powerOutput: {
      type: Number,
      required: [true, "Instantaneous power output (kW) is required"],
      min: [0, "Power output cannot be negative"]
    },

    energyGenerated: {
      type: Number,
      required: [true, "Energy generated (kWh) is required"],
      min: [0, "Energy generated cannot be negative"]
    },

    voltage: {
      type: Number,
      default: 230 // Volts
    },

    current: {
      type: Number,
      default: 0 // Amperes
    },

    temperature: {
      type: Number,
      default: 25 // Ambient or cell temperature in °C
    },

    irradiance: {
      type: Number,
      default: 800 // Solar irradiance in W/m²
    },

    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

generationSchema.index({ user: 1, timestamp: -1 });
generationSchema.index({ panel: 1, timestamp: -1 });

module.exports = mongoose.model("Generation", generationSchema);
