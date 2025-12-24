const District = require("../models/districtModel");

// @desc    Get all districts
// @route   GET /api/districts
const getDistricts = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let districts;
    let filteredCount;
    let totalCount = await District.countDocuments({});

    if (limitNum === -1) {
      districts = await District.find(query).sort({ name: 1 });
      filteredCount = districts.length;
    } else {
      const skip = (pageNum - 1) * limitNum;
      districts = await District.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum);
      filteredCount = await District.countDocuments(query);
    }

    res.json({
      success: true,
      data: districts,
      count: totalCount,
      filteredCount: filteredCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single district
// @route   GET /api/districts/:id
const getDistrictById = async (req, res) => {
  try {
    const district = await District.findById(req.params.id);
    if (!district) {
      return res.status(404).json({ message: "District not found" });
    }
    res.json({ success: true, data: district });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a district
// @route   POST /api/districts
const createDistrict = async (req, res) => {
  try {
    const district = await District.create(req.body);
    res.status(201).json({ success: true, data: district });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a district
// @route   PUT /api/districts/:id
const updateDistrict = async (req, res) => {
  try {
    const district = await District.findById(req.params.id);
    if (!district) {
      return res.status(404).json({ message: "District not found" });
    }
    const updatedDistrict = await District.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: updatedDistrict });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a district
// @route   DELETE /api/districts/:id
const deleteDistrict = async (req, res) => {
  try {
    const district = await District.findById(req.params.id);
    if (!district) {
      return res.status(404).json({ message: "District not found" });
    }
    await district.deleteOne();
    res.json({ success: true, message: "District removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDistricts,
  getDistrictById,
  createDistrict,
  updateDistrict,
  deleteDistrict,
};
