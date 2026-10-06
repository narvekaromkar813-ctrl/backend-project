const mongoose = require("mongoose");

const consumptionSchema = new mongoose.Schema(
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
      default: null,
      index: true
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },

    powerConsumed: {
      type: Number,
      required: [true, "Instantaneous power consumed (kW) is required"],
      min: [0, "Power consumed cannot be negative"]
    },

    energyConsumed: {
      type: Number,
      required: [true, "Energy consumed (kWh) is required"],
      min: [0, "Energy consumed cannot be negative"]
    },

    applianceCategory: {
      type: String,
      enum: ["general", "HVAC", "lighting", "appliances", "EV", "water_heater", "other"],
      default: "general"
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

consumptionSchema.index({ user: 1, timestamp: -1 });
consumptionSchema.index({ panel: 1, timestamp: -1 });

module.exports = mongoose.model("Consumption", consumptionSchema);
