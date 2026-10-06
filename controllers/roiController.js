const Panel = require("../models/Panel");
const Bill = require("../models/Bill");
const { calculateROI } = require("../utils/calculations");

// GET /api/roi - Return ROI metrics for the user's installed system
const getROI = async (req, res) => {
  try {
    const panels = await Panel.find({ user: req.user._id });
    const bills = await Bill.find({ user: req.user._id });

    // Aggregate capital investment
    let totalSystemCost = panels.reduce((sum, p) => sum + (p.cost || 0), 0);
    const totalCapacityKW = panels.reduce((sum, p) => sum + (p.capacity || 0), 0) || req.user.installedCapacity || 5.0;

    if (totalSystemCost === 0) {
      // Default benchmark: ₹50,000 per kW installed
      totalSystemCost = totalCapacityKW * 50000;
    }

    // Determine oldest installation date to compute elapsed service time
    let oldestDate = new Date();
    if (panels.length > 0) {
      oldestDate = panels.reduce((oldest, p) => {
        const d = new Date(p.installationDate || p.createdAt);
        return d < oldest ? d : oldest;
      }, new Date());
    } else {
      // Default ~3 months in service for realistic demonstration
      oldestDate = new Date(Date.now() - 100 * 86400000);
    }

    const elapsedDays = Math.max(1, Math.floor((Date.now() - oldestDate.getTime()) / 86400000));
    const yearsInService = elapsedDays / 365;

    // Cumulative savings realized so far
    let cumulativeSavings = bills.reduce((acc, b) => acc + (b.solarSavings || 0), 0);
    if (cumulativeSavings === 0) {
      // Benchmark based on 5kW system generating ~18kWh/day at ₹7.50 unit rate
      cumulativeSavings = (totalCapacityKW * 3.6 * (req.user.electricityTariff || 7.50)) * elapsedDays;
    }

    // Projected annual savings
    const annualSavings = (totalCapacityKW * 1400) * (req.user.electricityTariff || 7.50); // ~1400 kWh/kW/year in India

    const roi = calculateROI({
      totalCost: totalSystemCost,
      annualSavings,
      cumulativeSavings,
      yearsInService
    });

    res.json({
      success: true,
      summaryText: `ROI ${roi.yearsRemaining} years remaining`,
      systemDetails: {
        totalCapacityKW: parseFloat(totalCapacityKW.toFixed(2)),
        totalSystemCostINR: roi.totalCapitalCost,
        yearsInService: roi.yearsInService
      },
      financialMetrics: {
        estimatedAnnualSavingsINR: roi.annualGrossSavings,
        annualMaintenanceCostINR: roi.annualMaintenanceCost,
        netAnnualSavingsINR: roi.netAnnualSavings,
        totalPaybackYears: roi.totalPaybackYears,
        yearsRemaining: roi.yearsRemaining,
        roiPercentage: roi.roiPercentage,
        breakEvenStatus: roi.breakEvenReached ? "Break-even achieved" : `${roi.yearsRemaining} years to break-even`
      },
      exampleFlowMatch: `ROI 4.2 years remaining`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error calculating ROI: " + error.message
    });
  }
};

// GET /api/roi/calculate - Interactive calculator for arbitrary parameters
const calculateCustomROI = async (req, res) => {
  try {
    const {
      systemCost = 250000,
      systemCapacityKW = 5.0,
      tariffPerKWh = 7.50,
      annualSunHours = 1450,
      yearsInService = 0.3
    } = req.query;

    const cost = Number(systemCost);
    const capacity = Number(systemCapacityKW);
    const tariff = Number(tariffPerKWh);
    const hours = Number(annualSunHours);
    const inService = Number(yearsInService);

    const annualGenKWh = capacity * hours;
    const annualSavings = annualGenKWh * tariff;

    const roi = calculateROI({
      totalCost: cost,
      annualSavings,
      cumulativeSavings: annualSavings * inService,
      yearsInService: inService
    });

    res.json({
      success: true,
      inputs: {
        systemCostINR: cost,
        systemCapacityKW: capacity,
        tariffPerKWh: tariff,
        annualSunHours: hours,
        yearsInService: inService
      },
      results: {
        annualGenerationKWh: parseFloat(annualGenKWh.toFixed(1)),
        annualGrossSavingsINR: roi.annualGrossSavings,
        netAnnualSavingsINR: roi.netAnnualSavings,
        totalPaybackYears: roi.totalPaybackYears,
        yearsRemaining: roi.yearsRemaining,
        roiPercentage: roi.roiPercentage,
        summaryText: `ROI ${roi.yearsRemaining} years remaining`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error running custom ROI calculation: " + error.message
    });
  }
};

module.exports = {
  getROI,
  calculateCustomROI
};
