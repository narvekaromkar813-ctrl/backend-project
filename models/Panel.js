const mongoose = require("mongoose");

const panelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Panel name or installation name is required"],
      trim: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Panel owner user ID is required"],
      index: true
    },

    location: {
      type: String,
      default: "Rooftop Array",
      trim: true
    },

    capacity: {
      type: Number,
      required: [true, "Capacity in kW is required"],
      min: [0.1, "Capacity must be at least 0.1 kW"]
    },

    panelType: {
      type: String,
      enum: ["Monocrystalline", "Polycrystalline", "Thin-film", "Bifacial", "Other"],
      default: "Monocrystalline"
    },

    installationDate: {
      type: Date,
      default: Date.now
    },

    status: {
      type: String,
      enum: ["active", "maintenance", "inactive"],
      default: "active",
      index: true
    },

    cost: {
      type: Number,
      default: 50000, // Cost in currency (₹) per kW or total panel cost
      min: [0, "Cost cannot be negative"]
    },

    efficiency: {
      type: Number,
      default: 20.0, // Efficiency percentage
      min: [0, "Efficiency cannot be negative"],
      max: [100, "Efficiency cannot exceed 100%"]
    },

    tiltAngle: {
      type: Number,
      default: 20 // standard tilt angle in degrees
    },

    azimuthAngle: {
      type: Number,
      default: 180 // standard South-facing in degrees
    }
  },
  {
    timestamps: true
  }
);

panelSchema.index({ user: 1, name: 1 });

module.exports = mongoose.model("Panel", panelSchema);
