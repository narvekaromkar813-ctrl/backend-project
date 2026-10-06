const mongoose = require("mongoose");
const Panel = require("../models/Panel");
const User = require("../models/User");

// Create a new solar panel
const createPanel = async (req, res) => {
  try {
    const {
      name,
      capacity,
      location,
      panelType,
      installationDate,
      status,
      cost,
      efficiency,
      tiltAngle,
      azimuthAngle
    } = req.body;

    if (!name || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Panel name and capacity (in kW) are required"
      });
    }

    const panel = await Panel.create({
      name: name.trim(),
      capacity: Number(capacity),
      user: req.user._id,
      location: location || "Rooftop Array",
      panelType: panelType || "Monocrystalline",
      installationDate: installationDate || Date.now(),
      status: status || "active",
      cost: cost !== undefined ? Number(cost) : 50000 * Number(capacity),
      efficiency: efficiency !== undefined ? Number(efficiency) : 20.0,
      tiltAngle: tiltAngle !== undefined ? Number(tiltAngle) : 20,
      azimuthAngle: azimuthAngle !== undefined ? Number(azimuthAngle) : 180
    });

    // Optionally update user's aggregated capacity
    const allPanels = await Panel.find({ user: req.user._id });
    const totalKW = allPanels.reduce((sum, p) => sum + (p.capacity || 0), 0);
    await User.findByIdAndUpdate(req.user._id, { installedCapacity: totalKW });

    res.status(201).json({
      success: true,
      message: "Solar panel created successfully",
      panel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating solar panel: " + error.message
    });
  }
};

// Get all panels for the authenticated user
const getPanels = async (req, res) => {
  try {
    const { status, panelType, search, page = 1, limit = 20 } = req.query;

    const query = {};
    // Regular users see only their panels; Admins can see all or filter by user
    if (req.user.role !== "admin" || !req.query.all) {
      query.user = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    if (panelType) {
      query.panelType = panelType;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const total = await Panel.countDocuments(query);
    const panels = await Panel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalCapacity = panels.reduce((acc, p) => acc + (p.capacity || 0), 0);

    res.json({
      success: true,
      count: panels.length,
      total,
      totalCapacityKW: parseFloat(totalCapacity.toFixed(2)),
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
      panels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving solar panels: " + error.message
    });
  }
};

// Get single panel by ID
const getPanelById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Solar panel not found"
      });
    }

    const panel = await Panel.findById(req.params.id);

    if (!panel) {
      return res.status(404).json({
        success: false,
        message: "Solar panel not found"
      });
    }

    // Ownership check
    if (
      panel.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to access this solar panel"
      });
    }

    res.json({
      success: true,
      panel
    });
  } catch (error) {
    next(error);
  }
};

// Update panel details
const updatePanel = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Solar panel not found"
      });
    }

    let panel = await Panel.findById(req.params.id);

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
        message: "Forbidden: You do not have permission to modify this solar panel"
      });
    }

    const {
      name,
      capacity,
      location,
      panelType,
      status,
      cost,
      efficiency,
      tiltAngle,
      azimuthAngle
    } = req.body;

    if (name) panel.name = name.trim();
    if (capacity !== undefined) panel.capacity = Number(capacity);
    if (location) panel.location = location.trim();
    if (panelType) panel.panelType = panelType;
    if (status) panel.status = status;
    if (cost !== undefined) panel.cost = Number(cost);
    if (efficiency !== undefined) panel.efficiency = Number(efficiency);
    if (tiltAngle !== undefined) panel.tiltAngle = Number(tiltAngle);
    if (azimuthAngle !== undefined) panel.azimuthAngle = Number(azimuthAngle);

    await panel.save();

    // Recalculate total user capacity
    const allPanels = await Panel.find({ user: panel.user });
    const totalKW = allPanels.reduce((sum, p) => sum + (p.capacity || 0), 0);
    await User.findByIdAndUpdate(panel.user, { installedCapacity: totalKW });

    res.json({
      success: true,
      message: "Solar panel updated successfully",
      panel
    });
  } catch (error) {
    next(error);
  }
};

// Delete panel
const deletePanel = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Solar panel not found"
      });
    }

    const panel = await Panel.findById(req.params.id);

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
        message: "Forbidden: You do not have permission to delete this solar panel"
      });
    }

    const userId = panel.user;
    await Panel.findByIdAndDelete(req.params.id);

    // Recalculate total user capacity
    const allPanels = await Panel.find({ user: userId });
    const totalKW = allPanels.reduce((sum, p) => sum + (p.capacity || 0), 0);
    await User.findByIdAndUpdate(userId, { installedCapacity: totalKW });

    res.json({
      success: true,
      message: "Solar panel deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting solar panel: " + error.message
    });
  }
};

module.exports = {
  createPanel,
  getPanels,
  getPanelById,
  updatePanel,
  deletePanel
};
