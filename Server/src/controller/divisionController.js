const Division = require("../models/divisionModel");

// @desc    Get all divisions
// @route   GET /api/divisions
const getDivisions = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let divisions;
    let filteredCount;
    let totalCount = await Division.countDocuments({});

    if (limitNum === -1) {
      divisions = await Division.find(query).sort({ name: 1 });
      filteredCount = divisions.length;
    } else {
      const skip = (pageNum - 1) * limitNum;
      divisions = await Division.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum);
      filteredCount = await Division.countDocuments(query);
    }

    res.json({
      success: true,
      data: divisions,
      count: totalCount,
      filteredCount: filteredCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single division
// @route   GET /api/divisions/:id
const getDivisionById = async (req, res) => {
  try {
    const division = await Division.findById(req.params.id);
    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }
    res.json({ success: true, data: division });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a division
// @route   POST /api/divisions
const createDivision = async (req, res) => {
  try {
    const division = await Division.create(req.body);
    res.status(201).json({ success: true, data: division });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a division
// @route   PUT /api/divisions/:id
const updateDivision = async (req, res) => {
  try {
    const division = await Division.findById(req.params.id);
    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }
    const updatedDivision = await Division.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: updatedDivision });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a division
// @route   DELETE /api/divisions/:id
const deleteDivision = async (req, res) => {
  try {
    const division = await Division.findById(req.params.id);
    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }
    await division.deleteOne();
    res.json({ success: true, message: "Division removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDivisions,
  getDivisionById,
  createDivision,
  updateDivision,
  deleteDivision,
};
