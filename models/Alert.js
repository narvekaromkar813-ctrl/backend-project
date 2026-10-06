const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
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

    type: {
      type: String,
      enum: [
        "underperformance",
        "zero_generation",
        "maintenance_due",
        "cleaning_due",
        "inverter_fault",
        "overheating",
        "system_offline",
        "grid_outage",
        "general"
      ],
      default: "general"
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true
    },

    title: {
      type: String,
      required: [true, "Alert title is required"],
      trim: true
    },

    message: {
      type: String,
      required: [true, "Alert message is required"],
      trim: true
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true
    },

    isResolved: {
      type: Boolean,
      default: false,
      index: true
    },

    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

alertSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Alert", alertSchema);
