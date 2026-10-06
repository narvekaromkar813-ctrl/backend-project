const axios = require("axios");

const BASE_URL = "http://localhost:5001";
const timestamp = Date.now();
const testEmail = `student_${timestamp}@solarsight.local`;
const testPassword = "Password123!";
let token = "";
let panelId = "";
let alertId = "";

const results = [];

function assert(condition, message) {
  if (condition) {
    results.push({ test: message, status: "PASS" });
    console.log(`✅ PASS: ${message}`);
  } else {
    results.push({ test: message, status: "FAIL" });
    console.error(`❌ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("⚡ Starting SolarSight End-to-End API Test Suite");
  console.log("==================================================");

  try {
    // 1. Health check
    const healthRes = await axios.get(`${BASE_URL}/api/health`);
    assert(healthRes.status === 200 && healthRes.data.status === "OK", "GET /api/health returns 200 OK");

    // 2. Swagger docs check
    const docsRes = await axios.get(`${BASE_URL}/api-docs/`);
    assert(docsRes.status === 200, "GET /api-docs/ returns 200 OK");

    // 3. Unauthorized access check (protected route without JWT)
    try {
      await axios.get(`${BASE_URL}/api/panels`);
      assert(false, "Unprotected GET /api/panels should fail with 401");
    } catch (err) {
      assert(err.response?.status === 401, "GET /api/panels without token rejected with 401 Unauthorized");
    }

    // 4. Registration
    const regRes = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: "Omkar Narvekar",
      email: testEmail,
      password: testPassword,
      role: "user",
      installedCapacity: 5.0,
      electricityTariff: 7.50
    });
    assert(regRes.status === 201 && regRes.data.token, "POST /api/auth/register succeeds and yields JWT token");
    token = regRes.data.token;

    // Axios client configured with JWT auth
    const authClient = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    });

    // 5. Login
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    assert(loginRes.status === 200 && loginRes.data.token, "POST /api/auth/login succeeds with valid credentials");

    // 6. User profile
    const profileRes = await authClient.get("/api/auth/me");
    assert(profileRes.status === 200 && profileRes.data.user.email === testEmail, "GET /api/auth/me returns authenticated user profile");

    // 7. Update profile
    const updateProfileRes = await authClient.put("/api/auth/profile", {
      name: "Omkar Narvekar (Verified)",
      electricityTariff: 8.00
    });
    assert(updateProfileRes.status === 200 && updateProfileRes.data.user.name.includes("Verified"), "PUT /api/auth/profile updates profile");

    // 8. Create Solar Panel (CRUD - Create)
    const createPanelRes = await authClient.post("/api/panels", {
      name: "Rooftop Array 1 (Main)",
      capacity: 5.0,
      location: "Main Terrace South",
      panelType: "Monocrystalline",
      cost: 250000,
      efficiency: 21.5
    });
    assert(createPanelRes.status === 201 && createPanelRes.data.panel._id, "POST /api/panels registers new solar panel");
    panelId = createPanelRes.data.panel._id;

    // 9. Get all panels (CRUD - Read list)
    const getPanelsRes = await authClient.get("/api/panels");
    assert(getPanelsRes.status === 200 && getPanelsRes.data.panels.length > 0, "GET /api/panels lists user panels");

    // 10. Get single panel (CRUD - Read one)
    const getPanelRes = await authClient.get(`/api/panels/${panelId}`);
    assert(getPanelRes.status === 200 && getPanelRes.data.panel.name.includes("Rooftop Array"), "GET /api/panels/:id fetches single panel");

    // 11. Update panel (CRUD - Update)
    const updatePanelRes = await authClient.put(`/api/panels/${panelId}`, {
      status: "active",
      efficiency: 22.0
    });
    assert(updatePanelRes.status === 200 && updatePanelRes.data.panel.efficiency === 22.0, "PUT /api/panels/:id updates panel attributes");

    // 12. Seed demo generation
    const seedGenRes = await authClient.post("/api/generation/demo");
    assert(seedGenRes.status === 201, "POST /api/generation/demo seeds realistic telemetry curve");

    // 13. Record single generation reading
    const recordGenRes = await authClient.post("/api/generation", {
      panelId,
      powerOutput: 4.8,
      energyGenerated: 18.0,
      temperature: 31,
      irradiance: 890
    });
    assert(recordGenRes.status === 201, "POST /api/generation records new generation reading");

    // 14. Get generation summary and readings
    const getGenRes = await authClient.get("/api/generation");
    assert(getGenRes.status === 200 && getGenRes.data.summary.systemCapacityKW > 0, "GET /api/generation returns summary & readings");

    // 15. Get panel-specific generation
    const getPanelGenRes = await authClient.get(`/api/generation/panel/${panelId}`);
    assert(getPanelGenRes.status === 200 && getPanelGenRes.data.readings.length > 0, "GET /api/generation/panel/:id returns panel records");

    // 16. Seed demo consumption
    const seedConRes = await authClient.post("/api/consumption/demo");
    assert(seedConRes.status === 201, "POST /api/consumption/demo seeds consumption profile (~12 kWh)");

    // 17. Record single consumption reading
    const recordConRes = await authClient.post("/api/consumption", {
      panelId,
      powerConsumed: 2.8,
      energyConsumed: 12.0,
      applianceCategory: "HVAC"
    });
    assert(recordConRes.status === 201, "POST /api/consumption records consumption reading");

    // 18. Get consumption summary
    const getConRes = await authClient.get("/api/consumption");
    assert(getConRes.status === 200 && getConRes.data.readings.length > 0, "GET /api/consumption returns consumption history");

    // 19. Grid Export endpoint (Matches flow: "Consuming 12kWh, exporting 6kWh to grid")
    const gridExportRes = await authClient.get("/api/grid/export");
    assert(gridExportRes.status === 200 && gridExportRes.data.data.exportedKWh !== undefined, "GET /api/grid/export returns grid export balance");

    // 20. Grid Import endpoint
    const gridImportRes = await authClient.get("/api/grid/import");
    assert(gridImportRes.status === 200 && gridImportRes.data.data.importedKWh !== undefined, "GET /api/grid/import returns grid import balance");

    // 21. Create / Record Bill
    const createBillRes = await authClient.post("/api/bills", {
      billingMonth: "2026-09",
      totalConsumedKWh: 360,
      totalGeneratedKWh: 540,
      tariffPerKWh: 7.50
    });
    assert(createBillRes.status === 201, "POST /api/bills creates monthly electricity bill");

    // 22. Bills list and savings (Matches flow: "Monthly savings ₹2450 vs previous bills")
    const getBillsRes = await authClient.get("/api/bills");
    assert(getBillsRes.status === 200 && getBillsRes.data.summary.summaryText.includes("Monthly savings"), "GET /api/bills returns bill history & savings");

    // 23. Predict bill
    const predictBillRes = await authClient.get("/api/bills/predict");
    assert(predictBillRes.status === 200 && predictBillRes.data.prediction.estimatedSavingsINR !== undefined, "GET /api/bills/predict predicts current month bill");

    // 24. Monthly bills breakdown
    const monthlyBillsRes = await authClient.get("/api/bills/monthly");
    assert(monthlyBillsRes.status === 200 && Array.isArray(monthlyBillsRes.data.monthlyBreakdown), "GET /api/bills/monthly returns monthly breakdown");

    // 25. Check Alerts diagnostic (POST /api/alerts/check)
    const checkAlertsRes = await authClient.post("/api/alerts/check");
    assert(checkAlertsRes.status === 200, "POST /api/alerts/check runs automated system diagnostic");

    // 26. List alerts (Matches flow: "Panel #3 underperforming 8%, cleaning due with Socket.io")
    const getAlertsRes = await authClient.get("/api/alerts");
    assert(getAlertsRes.status === 200 && getAlertsRes.data.alerts.length > 0, "GET /api/alerts returns alert notifications");
    alertId = getAlertsRes.data.alerts[0]._id;

    // 27. Get alert by ID & mark read / resolve
    const getAlertRes = await authClient.get(`/api/alerts/${alertId}`);
    assert(getAlertRes.status === 200, "GET /api/alerts/:id retrieves alert details");

    const readAlertRes = await authClient.put(`/api/alerts/${alertId}/read`);
    assert(readAlertRes.status === 200 && readAlertRes.data.alert.isRead === true, "PUT /api/alerts/:id/read marks alert as read");

    const resolveAlertRes = await authClient.put(`/api/alerts/${alertId}/resolve`);
    assert(resolveAlertRes.status === 200 && resolveAlertRes.data.alert.isResolved === true, "PUT /api/alerts/:id/resolve resolves alert");

    // 28. ROI (Matches flow: "ROI 4.2 years remaining")
    const getRoiRes = await authClient.get("/api/roi");
    assert(getRoiRes.status === 200 && getRoiRes.data.summaryText.includes("ROI"), "GET /api/roi returns payback years remaining");

    // 29. Custom ROI calculation
    const calcRoiRes = await authClient.get("/api/roi/calculate?systemCost=250000&systemCapacityKW=5.0");
    assert(calcRoiRes.status === 200 && calcRoiRes.data.results.yearsRemaining > 0, "GET /api/roi/calculate executes scenario ROI math");

    // 30. Weather impact
    const weatherImpactRes = await authClient.get("/api/weather/impact?city=Mumbai");
    assert(weatherImpactRes.status === 200 && weatherImpactRes.data.impactAnalysis.overallEfficiencyPercentage !== undefined, "GET /api/weather/impact analyzes solar derating factors");

    // 31. Weather forecast
    const weatherForecastRes = await authClient.get("/api/weather/forecast?city=Mumbai");
    assert(weatherForecastRes.status === 200 && Array.isArray(weatherForecastRes.data.hourlyForecast), "GET /api/weather/forecast returns hourly solar generation forecast");

    // 32. Compare neighbors
    const compareRes = await authClient.get("/api/compare/neighbors");
    assert(compareRes.status === 200 && compareRes.data.userPerformance.neighborhoodRank, "GET /api/compare/neighbors benchmarks anonymous neighborhood data");

    // 33. Dispatch notification
    const sendNotifRes = await authClient.post("/api/notifications/send", {
      title: "Routine Inverter Check",
      body: "Weekly maintenance inspection completed successfully."
    });
    assert(sendNotifRes.status === 200 && sendNotifRes.data.success === true, "POST /api/notifications/send dispatches push & socket alert");

    // 34. Advanced Features: Battery Optimization
    const batteryRes = await authClient.get("/api/advanced/battery");
    assert(batteryRes.status === 200 && batteryRes.data.batterySystem.capacityKWh === 10, "GET /api/advanced/battery provides charge/discharge strategy");

    // 35. Advanced Features: EV Scheduler
    const evRes = await authClient.get("/api/advanced/ev-scheduler");
    assert(evRes.status === 200 && evRes.data.evSmartCharging.chargerStatus === "Ready", "GET /api/advanced/ev-scheduler calculates green solar charge window");

    // 36. Advanced Features: Carbon Savings
    const carbonRes = await authClient.get("/api/advanced/carbon-savings");
    assert(carbonRes.status === 200 && carbonRes.data.carbonOffset.co2AvoidedKg > 0, "GET /api/advanced/carbon-savings calculates CO2 avoided & trees equivalent");

    // 37. Advanced Features: Incentives
    const incentivesRes = await authClient.get("/api/advanced/incentives");
    assert(incentivesRes.status === 200 && incentivesRes.data.userClaims.length > 0, "GET /api/advanced/incentives retrieves subsidy schemes");

    // 38. Test Invalid Input & Bad ID handling
    try {
      await authClient.get("/api/panels/invalid_non_objectid_123");
      assert(false, "Invalid ObjectID should return error");
    } catch (err) {
      assert(err.response?.status === 404, "Invalid MongoDB ObjectID safely handled with 404 CastError");
    }

    // 39. Delete Panel (CRUD - Delete)
    // Create a temporary panel to test deletion cleanly
    const tempPanelRes = await authClient.post("/api/panels", {
      name: "Temporary Test Panel",
      capacity: 1.0
    });
    const tempId = tempPanelRes.data.panel._id;
    const delRes = await authClient.delete(`/api/panels/${tempId}`);
    assert(delRes.status === 200 && delRes.data.message.includes("deleted"), "DELETE /api/panels/:id removes panel");

    // 40. Change password securely
    const changePassRes = await authClient.put("/api/auth/change-password", {
      currentPassword: testPassword,
      newPassword: "NewSecurePassword123!"
    });
    assert(changePassRes.status === 200, "PUT /api/auth/change-password changes password securely");

    console.log("==================================================");
    console.log(`🎉 TEST SUMMARY: ${results.filter(r => r.status === "PASS").length} / ${results.length} PASSED`);
    console.log("==================================================");
  } catch (error) {
    console.error("Test execution failed unexpectedly:", error.response?.data || error.message);
  }
}

runTests();
