const Generation = require("../models/Generation");
const Panel = require("../models/Panel");
const { emitGenerationUpdate } = require("../config/socket");
const { dispatchAlert } = require("../services/notificationService");

// Record solar energy generation
const recordGeneration = async (req, res) => {
  try {
    const {
      panelId,
      powerOutput,
      energyGenerated,
      voltage,
      current,
      temperature,
      irradiance,
      notes,
      timestamp
    } = req.body;

    if (!panelId || powerOutput === undefined || energyGenerated === undefined) {
      return res.status(400).json({
        success: false,
        message: "panelId, powerOutput (kW), and energyGenerated (kWh) are required"
      });
    }

    const panel = await Panel.findById(panelId);
    if (!panel) {
      return res.status(404).json({
        success: false,
        message: "Solar panel not found"
      });
    }

    // Verify ownership
    if (
      panel.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not own this solar panel"
      });
    }

    const generation = await Generation.create({
      user: req.user._id,
      panel: panelId,
      powerOutput: Number(powerOutput),
      energyGenerated: Number(energyGenerated),
      voltage: voltage !== undefined ? Number(voltage) : 230,
      current: current !== undefined ? Number(current) : 0,
      temperature: temperature !== undefined ? Number(temperature) : 25,
      irradiance: irradiance !== undefined ? Number(irradiance) : 800,
      notes: notes || "",
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    // Broadcast live telemetry via Socket.IO
    emitGenerationUpdate(req.user._id.toString(), {
      panelId: panel._id,
      panelName: panel.name,
      powerOutput: generation.powerOutput,
      energyGenerated: generation.energyGenerated,
      temperature: generation.temperature,
      irradiance: generation.irradiance,
      timestamp: generation.timestamp
    });

    // Automated anomaly check: If daylight and power output is surprisingly zero or under 15% of rated capacity
    const hour = new Date(generation.timestamp).getHours();
    const isPeakSun = hour >= 9 && hour <= 16;
    if (isPeakSun && panel.capacity > 0) {
      const outputRatio = generation.powerOutput / panel.capacity;
      if (generation.powerOutput === 0) {
        await dispatchAlert({
          userId: req.user._id,
          panelId: panel._id,
          type: "zero_generation",
          severity: "high",
          title: `Zero Generation on ${panel.name}`,
          message: `Panel '${panel.name}' reported 0 kW output during peak daylight hours. Check inverter or wiring.`
        });
      } else if (outputRatio < 0.20 && (generation.irradiance || 0) > 600) {
        await dispatchAlert({
          userId: req.user._id,
          panelId: panel._id,
          type: "underperformance",
          severity: "medium",
          title: `Underperformance on ${panel.name}`,
          message: `Panel '${panel.name}' is underperforming by ~${Math.round((1 - outputRatio) * 100)}%. Soiling or cleaning may be due.`
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Generation reading recorded successfully",
      generation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error recording generation: " + error.message
    });
  }
};

// Get generation data and aggregate summaries for current user
const getGeneration = async (req, res) => {
  try {
    const { startDate, endDate, limit = 50, page = 1 } = req.query;

    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const readings = await Generation.find(query)
      .populate("panel", "name capacity panelType")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Calculate today's total and peak metrics
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayReadings = await Generation.find({
      user: req.user._id,
      timestamp: { $gte: startOfToday }
    });

    const todayEnergyKWh = todayReadings.reduce(
      (sum, r) => sum + (r.energyGenerated || 0),
      0
    );
    const peakPowerKW = todayReadings.reduce(
      (max, r) => Math.max(max, r.powerOutput || 0),
      0
    );
    const latestReading = readings[0] || null;

    // Get user panels to determine total system capacity
    const userPanels = await Panel.find({ user: req.user._id, status: "active" });
    const systemCapacityKW = userPanels.reduce((sum, p) => sum + (p.capacity || 0), 0) || req.user.installedCapacity || 5.0;

    res.json({
      success: true,
      summary: {
        systemCapacityKW: parseFloat(systemCapacityKW.toFixed(2)),
        todayEnergyKWh: parseFloat(todayEnergyKWh.toFixed(2)),
        peakPowerKW: parseFloat(peakPowerKW.toFixed(2)),
        currentPowerKW: latestReading ? latestReading.powerOutput : 0,
        todaySummaryText: `${systemCapacityKW}kW system generating ${todayEnergyKWh.toFixed(1)}kWh today`
      },
      count: readings.length,
      page: Number(page),
      readings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving generation readings: " + error.message
    });
  }
};

// Get generation for a specific panel
const getGenerationByPanel = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 30 } = req.query;

    const panel = await Panel.findById(id);
    if (!panel) {
      return res.status(404).json({
        success: false,
        message: "Solar panel not found"
      });
    }

    if (
      panel.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to access this panel"
      });
    }

    const readings = await Generation.find({ panel: id })
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    const totalKWh = readings.reduce((sum, r) => sum + (r.energyGenerated || 0), 0);
    const maxKW = readings.reduce((max, r) => Math.max(max, r.powerOutput || 0), 0);

    res.json({
      success: true,
      panel: {
        id: panel._id,
        name: panel.name,
        capacity: panel.capacity,
        status: panel.status
      },
      stats: {
        sampleCount: readings.length,
        totalEnergyKWh: parseFloat(totalKWh.toFixed(2)),
        peakPowerKW: parseFloat(maxKW.toFixed(2))
      },
      readings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching panel generation: " + error.message
    });
  }
};

// Helper endpoint to populate realistic demo telemetry for ease of testing & demonstration
const seedDemoGeneration = async (req, res) => {
  try {
    // Find or create a panel for the user
    let panel = await Panel.findOne({ user: req.user._id });
    if (!panel) {
      panel = await Panel.create({
        name: "Main Rooftop Array #1",
        capacity: 5.0,
        user: req.user._id,
        location: "Terrace North-Facing",
        panelType: "Monocrystalline",
        cost: 250000,
        efficiency: 21.0
      });
    }

    const now = new Date();
    const demoReadings = [];

    // Create 10 hourly data points simulating sunlight curve
    for (let i = 9; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3600000);
      const hour = time.getHours();
      let power = 0;
      let irradiance = 0;

      if (hour >= 6 && hour <= 18) {
        const sunAngle = Math.sin(((hour - 6) / 12) * Math.PI);
        power = parseFloat((panel.capacity * 0.9 * sunAngle).toFixed(2));
        irradiance = Math.round(950 * sunAngle);
      }

      demoReadings.push({
        user: req.user._id,
        panel: panel._id,
        powerOutput: power,
        energyGenerated: parseFloat((power * 1.0).toFixed(2)),
        irradiance,
        temperature: 30 + Math.round(power * 2),
        timestamp: time,
        notes: "Demo Telemetry"
      });
    }

    const created = await Generation.insertMany(demoReadings);

    // Broadcast the latest point to Socket.io
    const latest = created[created.length - 1];
    emitGenerationUpdate(req.user._id.toString(), {
      panelId: panel._id,
      panelName: panel.name,
      powerOutput: latest.powerOutput,
      energyGenerated: latest.energyGenerated,
      temperature: latest.temperature,
      irradiance: latest.irradiance,
      timestamp: latest.timestamp
    });

    res.status(201).json({
      success: true,
      message: `Created ${created.length} demo generation readings for panel '${panel.name}'`,
      panelId: panel._id,
      sampleLatest: latest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error seeding demo generation: " + error.message
    });
  }
};

module.exports = {
  recordGeneration,
  getGeneration,
  getGenerationByPanel,
  seedDemoGeneration
};
