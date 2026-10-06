const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, "Password is required"]
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    location: {
      city: { type: String, default: "Mumbai", trim: true },
      state: { type: String, default: "Maharashtra", trim: true },
      country: { type: String, default: "India", trim: true },
      latitude: { type: Number, default: 19.076 },
      longitude: { type: Number, default: 72.8777 }
    },

    installedCapacity: {
      type: Number,
      default: 5.0, // default 5 kW system
      min: [0, "Installed capacity cannot be negative"]
    },

    electricityTariff: {
      type: Number,
      default: 7.50, // default ₹7.50 per kWh
      min: [0, "Tariff cannot be negative"]
    },

    fcmToken: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);