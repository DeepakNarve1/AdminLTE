const getSamitiModel = require("../models/samitiModel");

// Get all items (with pagination, search, etc.)
exports.getAll = async (req, res) => {
  try {
    const samitiType = req.samitiType; // Passed from route middleware
    const SamitiModel = getSamitiModel(samitiType);

    const { page = 1, limit = 10, search } = req.query;

    // No need to filter by samitiType as we are in a specific collection
    const query = {};

    if (search) {
      query.$or = [
        { uniqueId: { $regex: search, $options: "i" } },
        { block: { $regex: search, $options: "i" } },
        { village: { $regex: search, $options: "i" } },
        { gramPanchayat: { $regex: search, $options: "i" } },
        { sector: { $regex: search, $options: "i" } },
        // Add Bhagoria search if needed, but generic search usually covers common fields
        { inChargeName: { $regex: search, $options: "i" } },
      ];
    }

    // Handle "All" entries (limit = -1)
    let paginationLimit = parseInt(limit);
    if (paginationLimit === -1) {
      paginationLimit = 0; // 0 means no limit in Mongoose
    }

    let queryBuilder = SamitiModel.find(query).sort({ createdAt: -1 });

    if (paginationLimit > 0) {
      queryBuilder = queryBuilder
        .limit(paginationLimit)
        .skip((page - 1) * paginationLimit);
    }

    const data = await queryBuilder;
    const count = await SamitiModel.countDocuments(query); // Total count matching filter

    res.status(200).json({
      success: true,
      count,
      filteredCount: count,
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single item
exports.getById = async (req, res) => {
  try {
    const samitiType = req.samitiType;
    const SamitiModel = getSamitiModel(samitiType);

    const item = await SamitiModel.findById(req.params.id);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Record not found" });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create item
exports.create = async (req, res) => {
  try {
    const samitiType = req.samitiType;
    const SamitiModel = getSamitiModel(samitiType);

    // req.body should contain the fields. We append samitiType and addedBy
    const newItem = await SamitiModel.create({
      ...req.body,
      samitiType, // Still saving it for reference, though implicit by collection
      addedBy: req.user ? req.user._id : undefined,
    });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Unique ID already exists for this Samiti",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update item
exports.update = async (req, res) => {
  try {
    const samitiType = req.samitiType;
    const SamitiModel = getSamitiModel(samitiType);

    const updatedItem = await SamitiModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedItem) {
      return res
        .status(404)
        .json({ success: false, message: "Record not found" });
    }
    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete item
exports.delete = async (req, res) => {
  try {
    const samitiType = req.samitiType;
    const SamitiModel = getSamitiModel(samitiType);

    const deletedItem = await SamitiModel.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res
        .status(404)
        .json({ success: false, message: "Record not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
