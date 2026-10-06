const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true
    },

    billingMonth: {
      type: String, // e.g. "2026-09"
      required: [true, "Billing month (YYYY-MM) is required"],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, "Billing month must follow YYYY-MM format"]
    },

    totalConsumedKWh: {
      type: Number,
      required: true,
      min: [0, "Consumed kWh cannot be negative"]
    },

    totalGeneratedKWh: {
      type: Number,
      required: true,
      min: [0, "Generated kWh cannot be negative"]
    },

    exportedKWh: {
      type: Number,
      default: 0,
      min: [0, "Exported kWh cannot be negative"]
    },

    importedKWh: {
      type: Number,
      default: 0,
      min: [0, "Imported kWh cannot be negative"]
    },

    tariffPerKWh: {
      type: Number,
      required: true,
      default: 7.50
    },

    feedInTariffPerKWh: {
      type: Number,
      default: 3.50 // Feed-in credit rate per kWh exported
    },

    grossAmountWithoutSolar: {
      type: Number,
      required: true,
      comment: "What the customer would have paid without solar (totalConsumed * tariff)"
    },

    solarSavings: {
      type: Number,
      required: true,
      comment: "Total money saved this billing cycle in ₹"
    },

    netPayable: {
      type: Number,
      required: true,
      comment: "Actual amount due to the electric utility in ₹"
    },

    status: {
      type: String,
      enum: ["paid", "pending", "overdue"],
      default: "pending"
    },

    dueDate: {
      type: Date
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

billSchema.index({ user: 1, billingMonth: 1 }, { unique: true });

module.exports = mongoose.model("Bill", billSchema);
