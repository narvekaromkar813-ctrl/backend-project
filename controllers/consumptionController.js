const Consumption = require("../models/Consumption");
const Panel = require("../models/Panel");

// Record electricity consumption
const recordConsumption = async (req, res) => {
  try {
    const {
      panelId,
      powerConsumed,
      energyConsumed,
      applianceCategory,
      notes,
      timestamp
    } = req.body;

    if (powerConsumed === undefined || energyConsumed === undefined) {
      return res.status(400).json({
        success: false,
        message: "powerConsumed (kW) and energyConsumed (kWh) are required"
      });
    }

    const consumption = await Consumption.create({
      user: req.user._id,
      panel: panelId || null,
      powerConsumed: Number(powerConsumed),
      energyConsumed: Number(energyConsumed),
      applianceCategory: applianceCategory || "general",
      notes: notes || "",
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    res.status(201).json({
      success: true,
      message: "Consumption reading recorded successfully",
      consumption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error recording consumption: " + error.message
    });
  }
};

// Get consumption history and summaries
const getConsumption = async (req, res) => {
  try {
    const { startDate, endDate, applianceCategory, limit = 50, page = 1 } = req.query;

    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (applianceCategory) {
      query.applianceCategory = applianceCategory;
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const readings = await Consumption.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Calculate today's consumption
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayReadings = await Consumption.find({
      user: req.user._id,
      timestamp: { $gte: startOfToday }
    });

    const todayConsumedKWh = todayReadings.reduce(
      (sum, r) => sum + (r.energyConsumed || 0),
      0
    );
    const peakDemandKW = todayReadings.reduce(
      (max, r) => Math.max(max, r.powerConsumed || 0),
      0
    );
    const latestReading = readings[0] || null;

    res.json({
      success: true,
      summary: {
        todayConsumedKWh: parseFloat(todayConsumedKWh.toFixed(2)),
        peakDemandKW: parseFloat(peakDemandKW.toFixed(2)),
        currentPowerDemandKW: latestReading ? latestReading.powerConsumed : 0
      },
      count: readings.length,
      page: Number(page),
      readings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving consumption readings: " + error.message
    });
  }
};

// Get consumption associated with a specific panel/system
const getConsumptionByPanel = async (req, res) => {
  try {
    const { id } = req.params;

    const readings = await Consumption.find({
      user: req.user._id,
      panel: id
    }).sort({ timestamp: -1 });

    const totalKWh = readings.reduce((sum, r) => sum + (r.energyConsumed || 0), 0);

    res.json({
      success: true,
      panelId: id,
      totalConsumedKWh: parseFloat(totalKWh.toFixed(2)),
      sampleCount: readings.length,
      readings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching consumption for panel: " + error.message
    });
  }
};

// Demo seeder for consumption
const seedDemoConsumption = async (req, res) => {
  try {
    const now = new Date();
    const demoItems = [];

    // Simulate 12 kWh consumed today across 6 time blocks
    const applianceList = ["HVAC", "appliances", "lighting", "general", "water_heater", "general"];
    const powerLevels = [2.2, 1.5, 0.8, 3.1, 2.5, 1.9];

    for (let i = 5; i >= 0; i--) {
      demoItems.push({
        user: req.user._id,
        powerConsumed: powerLevels[i],
        energyConsumed: parseFloat((powerLevels[i] * 1.0).toFixed(2)), // ~2 kWh per period = 12 kWh total
        applianceCategory: applianceList[i],
        timestamp: new Date(now.getTime() - i * 2 * 3600000),
        notes: "Demo Consumption Profile"
      });
    }

    const created = await Consumption.insertMany(demoItems);

    res.status(201).json({
      success: true,
      message: `Created ${created.length} demo consumption records (~12 kWh total)`,
      records: created
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error seeding demo consumption: " + error.message
    });
  }
};

module.exports = {
  recordConsumption,
  getConsumption,
  getConsumptionByPanel,
  seedDemoConsumption
};
