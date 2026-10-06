/**
 * SolarSight Engineering & Financial Calculation Utilities
 * 
 * All formulas adhere to standard photovoltaic engineering and utility net-metering principles.
 */

// Central Electricity Authority (CEA) emission baseline: ~0.82 kg CO2 per kWh
const CO2_KG_PER_KWH = 0.82;
// 1 mature tree absorbs approximately 21.77 kg of CO2 per year
const CO2_KG_PER_TREE_YEAR = 21.77;

/**
 * Distinguish between instantaneous power and energy over time:
 * Power (kW): Rate of energy generation or consumption at an exact moment
 * Energy (kWh): Power integrated over elapsed hours (Power in kW * Time in hours)
 */

/**
 * Calculate net grid exchange for a given generation and consumption
 * @param {number} generationKWh - Solar energy produced in kWh
 * @param {number} consumptionKWh - Total energy consumed in kWh
 * @returns {object} { selfConsumedKWh, exportedKWh, importedKWh, netKWh }
 */
function calculateGridBalance(generationKWh, consumptionKWh) {
  const gen = Math.max(0, Number(generationKWh) || 0);
  const con = Math.max(0, Number(consumptionKWh) || 0);

  let selfConsumedKWh = 0;
  let exportedKWh = 0;
  let importedKWh = 0;

  if (gen >= con) {
    selfConsumedKWh = con;
    exportedKWh = parseFloat((gen - con).toFixed(2));
    importedKWh = 0;
  } else {
    selfConsumedKWh = gen;
    exportedKWh = 0;
    importedKWh = parseFloat((con - gen).toFixed(2));
  }

  // Net: positive means net surplus exported; negative means net deficit imported
  const netKWh = parseFloat((exportedKWh - importedKWh).toFixed(2));

  return {
    generationKWh: parseFloat(gen.toFixed(2)),
    consumptionKWh: parseFloat(con.toFixed(2)),
    selfConsumedKWh: parseFloat(selfConsumedKWh.toFixed(2)),
    exportedKWh,
    importedKWh,
    netKWh
  };
}

/**
 * Calculate electricity bill, savings, and net payable
 * @param {object} params
 * @param {number} params.consumedKWh
 * @param {number} params.generatedKWh
 * @param {number} [params.tariffPerKWh=7.50] - Standard electricity unit rate (₹/kWh)
 * @param {number} [params.feedInTariffPerKWh=3.50] - Net metering export credit rate (₹/kWh)
 * @returns {object}
 */
function calculateElectricitySavings({
  consumedKWh,
  generatedKWh,
  tariffPerKWh = 7.50,
  feedInTariffPerKWh = 3.50
}) {
  const balance = calculateGridBalance(generatedKWh, consumedKWh);
  const tariff = Math.max(0.1, Number(tariffPerKWh) || 7.50);
  const feedIn = Math.max(0, Number(feedInTariffPerKWh) || 3.50);

  // Baseline bill without solar
  const grossAmountWithoutSolar = parseFloat((balance.consumptionKWh * tariff).toFixed(2));

  // Bill with solar
  const importCost = balance.importedKWh * tariff;
  const exportCredit = balance.exportedKWh * feedIn;
  const netPayable = parseFloat(Math.max(0, importCost - exportCredit).toFixed(2));

  // Savings realized = bill without solar - net payable
  const solarSavings = parseFloat(Math.max(0, grossAmountWithoutSolar - netPayable).toFixed(2));

  return {
    ...balance,
    tariffPerKWh: tariff,
    feedInTariffPerKWh: feedIn,
    grossAmountWithoutSolar,
    netPayable,
    solarSavings,
    savingsPercentage: grossAmountWithoutSolar > 0
      ? parseFloat(((solarSavings / grossAmountWithoutSolar) * 100).toFixed(1))
      : 0
  };
}

/**
 * Calculate Return on Investment (ROI) and Payback Period
 * @param {object} params
 * @param {number} params.totalCost - Initial capital expenditure (₹)
 * @param {number} params.annualSavings - Estimated or actual annual financial savings (₹/year)
 * @param {number} [params.cumulativeSavings=0] - Total savings accumulated so far (₹)
 * @param {number} [params.yearsInService=0] - Years since installation
 * @param {number} [params.annualMaintenanceRate=0.01] - 1% estimated annual maintenance
 */
function calculateROI({
  totalCost,
  annualSavings,
  cumulativeSavings = 0,
  yearsInService = 0,
  annualMaintenanceRate = 0.01
}) {
  const cost = Math.max(1, Number(totalCost) || 250000);
  const maintenance = cost * annualMaintenanceRate;
  const netAnnualSavings = Math.max(100, (Number(annualSavings) || 55000) - maintenance);

  // Simple Payback period (years) = Total System Cost / Net Annual Savings
  const totalPaybackYears = parseFloat((cost / netAnnualSavings).toFixed(1));
  const remainingYears = parseFloat(Math.max(0, totalPaybackYears - (Number(yearsInService) || 0)).toFixed(1));

  // Cumulative Return % = (Cumulative Savings / Cost) * 100
  const roiPercentage = parseFloat(((cumulativeSavings / cost) * 100).toFixed(1));

  return {
    totalCapitalCost: cost,
    annualGrossSavings: parseFloat((Number(annualSavings) || 55000).toFixed(2)),
    annualMaintenanceCost: parseFloat(maintenance.toFixed(2)),
    netAnnualSavings: parseFloat(netAnnualSavings.toFixed(2)),
    totalPaybackYears,
    yearsInService: parseFloat(Number(yearsInService || 0).toFixed(1)),
    yearsRemaining: remainingYears,
    roiPercentage,
    breakEvenReached: remainingYears <= 0
  };
}

/**
 * Calculate Environmental Carbon Savings
 * @param {number} totalGeneratedKWh 
 */
function calculateEnvironmentalSavings(totalGeneratedKWh) {
  const kWh = Math.max(0, Number(totalGeneratedKWh) || 0);
  const co2AvoidedKg = parseFloat((kWh * CO2_KG_PER_KWH).toFixed(2));
  const treesEquivalent = parseFloat((co2AvoidedKg / CO2_KG_PER_TREE_YEAR).toFixed(1));
  const coalAvoidedKg = parseFloat((kWh * 0.45).toFixed(2)); // ~0.45 kg of coal per kWh

  return {
    totalCleanKWh: kWh,
    co2AvoidedKg,
    treesEquivalent,
    coalAvoidedKg
  };
}

module.exports = {
  calculateGridBalance,
  calculateElectricitySavings,
  calculateROI,
  calculateEnvironmentalSavings,
  CO2_KG_PER_KWH,
  CO2_KG_PER_TREE_YEAR
};
