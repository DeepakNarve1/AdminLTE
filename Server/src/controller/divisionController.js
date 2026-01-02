const Division = require("../models/divisionModel");

// @desc    Get all divisions
// @route   GET /api/divisions
const getDivisions = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, state } = req.query;

    const query = {};

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    if (state) {
      query.state = state;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let divisions;
    let filteredCount;
    let totalCount = await Division.countDocuments({});

    if (limitNum === -1) {
      divisions = await Division.find(query)
        .populate("state", "name")
        .sort({ name: 1 });
      filteredCount = divisions.length;
    } else {
      const skip = (pageNum - 1) * limitNum;
      divisions = await Division.find(query)
        .populate("state", "name")
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
// @desc    Get single division
// @route   GET /api/divisions/:id
const getDivisionById = async (req, res) => {
  try {
    const division = await Division.findById(req.params.id).populate(
      "state",
      "name"
    );
    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }
    const District = require("../models/districtModel");
    const districts = await District.find({ division: division._id });
    const Parliament = require("../models/parliamentModel");
    const parliaments = await Parliament.find({ division: division._id });

    res.json({
      success: true,
      data: { ...division.toObject(), districts, parliaments },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a division
// @route   POST /api/divisions
const createDivision = async (req, res) => {
  try {
    const { name, state, districts, parliaments } = req.body;
    const division = await Division.create({ name, state });

    if (districts && Array.isArray(districts) && districts.length > 0) {
      const District = require("../models/districtModel");
      const districtsToInsert = districts
        .filter((d) => d && d.trim() !== "")
        .map((d) => ({
          name: d,
          division: division._id,
        }));
      if (districtsToInsert.length > 0) {
        await District.insertMany(districtsToInsert);
      }
    }

    if (parliaments && Array.isArray(parliaments) && parliaments.length > 0) {
      const Parliament = require("../models/parliamentModel");
      const parliamentsToInsert = parliaments
        .filter((p) => p && p.trim() !== "")
        .map((p) => ({
          name: p,
          division: division._id,
        }));
      if (parliamentsToInsert.length > 0) {
        await Parliament.insertMany(parliamentsToInsert);
      }
    }

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

    const { districts, parliaments } = req.body;
    if (districts && Array.isArray(districts) && districts.length > 0) {
      const District = require("../models/districtModel");
      const districtsToInsert = districts
        .filter((d) => d && d.trim() !== "")
        .map((d) => ({
          name: d,
          division: updatedDivision._id,
        }));
      if (districtsToInsert.length > 0) {
        await District.insertMany(districtsToInsert);
      }
    }

    if (parliaments && Array.isArray(parliaments) && parliaments.length > 0) {
      const Parliament = require("../models/parliamentModel");
      const parliamentsToInsert = parliaments
        .filter((p) => p && p.trim() !== "")
        .map((p) => ({
          name: p,
          division: updatedDivision._id,
        }));
      if (parliamentsToInsert.length > 0) {
        await Parliament.insertMany(parliamentsToInsert);
      }
    }

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
