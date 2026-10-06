const Generation = require("../models/Generation");
const Panel = require("../models/Panel");
const Incentive = require("../models/Incentive");
const { calculateEnvironmentalSavings } = require("../utils/calculations");

// GET /api/advanced/battery - Battery Storage Optimization
const getBatteryOptimization = async (req, res) => {
  try {
    const panels = await Panel.find({ user: req.user._id, status: "active" });
    const capacityKW = panels.reduce((s, p) => s + (p.capacity || 0), 0) || req.user.installedCapacity || 5.0;

    const hour = new Date().getHours();
    const batteryCapacityKWh = 10.0; // Standard residential 10 kWh lithium storage
    let currentSoC = 65; // State of charge %
    let currentMode = "Standby";
    let recommendation = "";

    if (hour >= 9 && hour <= 15) {
      currentMode = "Charging (Solar Surplus)";
      currentSoC = Math.min(95, 40 + (hour - 9) * 8);
      recommendation = "Optimal charging window: Storing excess daytime solar generation to avoid low feed-in credits.";
    } else if (hour >= 18 && hour <= 22) {
      currentMode = "Discharging (Peak Shaving)";
      currentSoC = Math.max(25, 90 - (hour - 18) * 15);
      recommendation = "Peak grid tariff active: Discharging battery to power home loads and eliminate peak grid electricity costs.";
    } else {
      currentMode = "Idle / Reserve";
      currentSoC = 45;
      recommendation = "Maintaining minimum 20% backup buffer for grid power outages.";
    }

    res.json({
      success: true,
      batterySystem: {
        capacityKWh: batteryCapacityKWh,
        currentChargePercentage: currentSoC,
        storedEnergyKWh: parseFloat(((currentSoC / 100) * batteryCapacityKWh).toFixed(2)),
        operatingMode: currentMode,
        healthPercentage: 98
      },
      scheduleStrategy: {
        solarChargeWindow: "09:00 - 15:00 (Surplus Solar Absorption)",
        peakDischargeWindow: "18:00 - 22:00 (Avoid Peak Grid Tariffs)",
        overnightReserve: "22:00 - 06:00 (Emergency Backup Buffer)"
      },
      recommendation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error optimizing battery storage: " + error.message
    });
  }
};

// GET /api/advanced/ev-scheduler - Smart EV Charging Schedule
const getEVScheduler = async (req, res) => {
  try {
    const panels = await Panel.find({ user: req.user._id, status: "active" });
    const capacityKW = panels.reduce((s, p) => s + (p.capacity || 0), 0) || req.user.installedCapacity || 5.0;

    res.json({
      success: true,
      evSmartCharging: {
        chargerStatus: "Ready",
        recommendedChargingWindow: "11:00 AM - 03:00 PM",
        reason: "Peak solar generation exceeds domestic household base load by ~2.5 - 3.5 kW.",
        solarEnergyAllocatedKWh: 14.5,
        estimatedVehicleRangeAddedKm: 95,
        gridCostAvoidedINR: parseFloat((14.5 * (req.user.electricityTariff || 7.50)).toFixed(2)),
        zeroEmissionCharge: true
      },
      scheduleRules: [
        { time: "00:00 - 10:00", mode: "Pause Charging", rate: "Base load priority" },
        { time: "11:00 - 15:00", mode: "Fast Solar Charge (3.3 kW)", rate: "100% Free Green Energy" },
        { time: "15:00 - 18:00", mode: "Trickle Solar Charge (1.2 kW)", rate: "Excess solar buffer" },
        { time: "18:00 - 24:00", mode: "Pause Charging", rate: "Avoid high peak grid tariffs" }
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching EV scheduler: " + error.message
    });
  }
};

// GET /api/advanced/carbon-savings - Carbon & Environmental Tracker
const getCarbonSavings = async (req, res) => {
  try {
    const allGen = await Generation.find({ user: req.user._id });
    let totalGeneratedKWh = allGen.reduce((sum, r) => sum + (r.energyGenerated || 0), 0);

    // If fresh install, use standard 5kW baseline (~1,250 kWh clean generated)
    if (totalGeneratedKWh === 0) {
      totalGeneratedKWh = 1250;
    }

    const environmental = calculateEnvironmentalSavings(totalGeneratedKWh);

    res.json({
      success: true,
      totalCleanSolarGeneratedKWh: environmental.totalCleanKWh,
      carbonOffset: {
        co2AvoidedKg: environmental.co2AvoidedKg,
        co2AvoidedTonnes: parseFloat((environmental.co2AvoidedKg / 1000).toFixed(3)),
        treesEquivalent: environmental.treesEquivalent,
        coalAvoidedKg: environmental.coalAvoidedKg
      },
      methodology: {
        standardFactor: "0.82 kg CO2 per kWh (Central Electricity Authority CEA Grid Baseline)",
        treeAbsorptionFactor: "21.77 kg CO2 absorbed per mature tree annually",
        coalCombustionFactor: "0.45 kg coal burned per thermal kWh"
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error calculating carbon savings: " + error.message
    });
  }
};

// GET /api/advanced/incentives - Government Solar Subsidies & Net Metering
const getIncentives = async (req, res) => {
  try {
    let incentives = await Incentive.find({ user: req.user._id });

    if (incentives.length === 0) {
      // Seed initial subsidy record
      const defaultIncentive = await Incentive.create({
        user: req.user._id,
        schemeName: "PM Surya Ghar: Muft Bijli Yojana (Rooftop Solar Subsidy)",
        subsidyAmount: 78000,
        systemCapacityKW: req.user.installedCapacity || 5.0,
        status: "approved",
        applicationNumber: `PMSG-${Math.floor(100000 + Math.random() * 900000)}`
      });
      incentives = [defaultIncentive];
    }

    res.json({
      success: true,
      count: incentives.length,
      nationalSchemesAvailable: [
        {
          name: "PM Surya Ghar: Muft Bijli Yojana",
          benefit: "Up to ₹78,000 direct subsidy for rooftop solar systems >= 3 kW",
          authority: "Ministry of New and Renewable Energy (MNRE)",
          eligibility: "Residential grid-connected rooftop solar installations"
        },
        {
          name: "State Net Metering Banking Policy",
          benefit: "1:1 banking credit rollover for surplus solar energy exported to grid",
          settlementCycle: "Annual financial true-up"
        }
      ],
      userClaims: incentives
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving incentives: " + error.message
    });
  }
};

// POST /api/advanced/incentives - Submit new incentive claim
const createIncentiveClaim = async (req, res) => {
  try {
    const { schemeName, subsidyAmount, systemCapacityKW } = req.body;

    const claim = await Incentive.create({
      user: req.user._id,
      schemeName: schemeName || "PM Surya Ghar: Muft Bijli Yojana",
      subsidyAmount: subsidyAmount || 78000,
      systemCapacityKW: systemCapacityKW || req.user.installedCapacity || 5.0,
      status: "submitted",
      applicationNumber: `PMSG-${Math.floor(100000 + Math.random() * 900000)}`
    });

    res.status(201).json({
      success: true,
      message: "Incentive application submitted successfully",
      claim
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error submitting incentive claim: " + error.message
    });
  }
};

module.exports = {
  getBatteryOptimization,
  getEVScheduler,
  getCarbonSavings,
  getIncentives,
  createIncentiveClaim
};
