const mongoose = require("mongoose");

const incentiveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    schemeName: {
      type: String,
      required: true,
      default: "PM Surya Ghar: Muft Bijli Yojana"
    },
    subsidyAmount: {
      type: Number,
      required: true,
      default: 78000 // Standard subsidy for 3kW+ rooftop solar in India
    },
    systemCapacityKW: {
      type: Number,
      required: true,
      default: 5.0
    },
    status: {
      type: String,
      enum: ["submitted", "under_review", "approved", "disbursed", "rejected"],
      default: "approved"
    },
    disbursementDate: {
      type: Date,
      default: Date.now
    },
    applicationNumber: {
      type: String,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Incentive", incentiveSchema);
