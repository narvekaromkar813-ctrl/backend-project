const Generation = require("../models/Generation");
const Consumption = require("../models/Consumption");
const { calculateGridBalance } = require("../utils/calculations");

// Helper to calculate generation and consumption totals over a date interval
async function getIntervalTotals(userId, startDate, endDate) {
  const genMatch = { user: userId };
  const conMatch = { user: userId };

  if (startDate || endDate) {
    genMatch.timestamp = {};
    conMatch.timestamp = {};
    if (startDate) {
      genMatch.timestamp.$gte = new Date(startDate);
      conMatch.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      genMatch.timestamp.$lte = new Date(endDate);
      conMatch.timestamp.$lte = new Date(endDate);
    }
  } else {
    // Default to today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    genMatch.timestamp = { $gte: startOfToday };
    conMatch.timestamp = { $gte: startOfToday };
  }

  const [genDocs, conDocs] = await Promise.all([
    Generation.find(genMatch),
    Consumption.find(conMatch)
  ]);

  const totalGenerationKWh = genDocs.reduce((s, r) => s + (r.energyGenerated || 0), 0);
  const totalConsumptionKWh = conDocs.reduce((s, r) => s + (r.energyConsumed || 0), 0);

  return { totalGenerationKWh, totalConsumptionKWh, genCount: genDocs.length, conCount: conDocs.length };
}

// GET /api/grid/export
const getGridExport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { totalGenerationKWh, totalConsumptionKWh } = await getIntervalTotals(
      req.user._id,
      startDate,
      endDate
    );

    const balance = calculateGridBalance(totalGenerationKWh, totalConsumptionKWh);
    const feedInRate = 3.50; // Feed-in credit ₹/kWh
    const creditEarned = parseFloat((balance.exportedKWh * feedInRate).toFixed(2));

    res.json({
      success: true,
      message: `Consuming ${balance.consumptionKWh}kWh, exporting ${balance.exportedKWh}kWh to grid`,
      summaryText: `Consuming ${balance.consumptionKWh}kWh, exporting ${balance.exportedKWh}kWh to grid`,
      data: {
        totalGenerationKWh: balance.generationKWh,
        totalConsumptionKWh: balance.consumptionKWh,
        selfConsumedKWh: balance.selfConsumedKWh,
        exportedKWh: balance.exportedKWh,
        feedInTariffPerKWh: feedInRate,
        estimatedCreditEarnedINR: creditEarned,
        isNetExporter: balance.exportedKWh > 0,
        period: startDate || endDate ? "custom_range" : "today"
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error calculating grid export: " + error.message
    });
  }
};

// GET /api/grid/import
const getGridImport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { totalGenerationKWh, totalConsumptionKWh } = await getIntervalTotals(
      req.user._id,
      startDate,
      endDate
    );

    const balance = calculateGridBalance(totalGenerationKWh, totalConsumptionKWh);
    const tariffRate = req.user.electricityTariff || 7.50;
    const importCost = parseFloat((balance.importedKWh * tariffRate).toFixed(2));

    res.json({
      success: true,
      message: balance.importedKWh > 0
        ? `Importing ${balance.importedKWh}kWh from grid to satisfy load`
        : `Zero grid import — solar production fully covers current consumption`,
      summaryText: `Importing ${balance.importedKWh}kWh from grid`,
      data: {
        totalGenerationKWh: balance.generationKWh,
        totalConsumptionKWh: balance.consumptionKWh,
        selfConsumedKWh: balance.selfConsumedKWh,
        importedKWh: balance.importedKWh,
        tariffPerKWh: tariffRate,
        estimatedImportCostINR: importCost,
        solarSelfSufficiencyPercentage: balance.consumptionKWh > 0
          ? parseFloat(((balance.selfConsumedKWh / balance.consumptionKWh) * 100).toFixed(1))
          : 100,
        period: startDate || endDate ? "custom_range" : "today"
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error calculating grid import: " + error.message
    });
  }
};

module.exports = {
  getGridExport,
  getGridImport
};
