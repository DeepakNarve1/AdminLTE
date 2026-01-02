const Parliament = require("../models/parliamentModel");

// @desc    Get all parliaments
// @route   GET /api/parliaments
const getParliaments = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, division } = req.query;

    const query = {};

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    if (division) {
      query.division = division;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let parliaments;
    let filteredCount;
    let totalCount = await Parliament.countDocuments({});

    if (limitNum === -1) {
      parliaments = await Parliament.find(query)
        .populate("division", "name")
        .sort({ name: 1 });
      filteredCount = parliaments.length;
    } else {
      const skip = (pageNum - 1) * limitNum;
      parliaments = await Parliament.find(query)
        .populate("division", "name")
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum);
      filteredCount = await Parliament.countDocuments(query);
    }

    res.json({
      success: true,
      data: parliaments,
      count: totalCount,
      filteredCount: filteredCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single parliament
// @route   GET /api/parliaments/:id
const getParliamentById = async (req, res) => {
  try {
    const parliament = await Parliament.findById(req.params.id).populate(
      "division",
      "name"
    );
    if (!parliament) {
      return res.status(404).json({ message: "Parliament not found" });
    }
    const Assembly = require("../models/assemblyModel");
    const assemblies = await Assembly.find({ parliament: parliament._id });

    res.json({ success: true, data: { ...parliament.toObject(), assemblies } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a parliament
// @route   POST /api/parliaments
const createParliament = async (req, res) => {
  try {
    const { name, division, assemblies } = req.body;
    const parliament = await Parliament.create({ name, division });

    if (assemblies && Array.isArray(assemblies) && assemblies.length > 0) {
      const Assembly = require("../models/assemblyModel");
      const assembliesToInsert = assemblies
        .filter((d) => d && d.trim() !== "")
        .map((d) => ({
          name: d,
          parliament: parliament._id,
        }));
      if (assembliesToInsert.length > 0) {
        await Assembly.insertMany(assembliesToInsert);
      }
    }

    res.status(201).json({ success: true, data: parliament });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a parliament
// @route   PUT /api/parliaments/:id
const updateParliament = async (req, res) => {
  try {
    const parliament = await Parliament.findById(req.params.id);
    if (!parliament) {
      return res.status(404).json({ message: "Parliament not found" });
    }
    const updatedParliament = await Parliament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    const { assemblies } = req.body;
    if (assemblies && Array.isArray(assemblies) && assemblies.length > 0) {
      const Assembly = require("../models/assemblyModel");
      const assembliesToInsert = assemblies
        .filter((d) => d && d.trim() !== "")
        .map((d) => ({
          name: d,
          parliament: updatedParliament._id,
        }));
      if (assembliesToInsert.length > 0) {
        await Assembly.insertMany(assembliesToInsert);
      }
    }

    res.json({ success: true, data: updatedParliament });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a parliament
// @route   DELETE /api/parliaments/:id
const deleteParliament = async (req, res) => {
  try {
    const parliament = await Parliament.findById(req.params.id);
    if (!parliament) {
      return res.status(404).json({ message: "Parliament not found" });
    }
    await parliament.deleteOne();
    res.json({ success: true, message: "Parliament removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getParliaments,
  getParliamentById,
  createParliament,
  updateParliament,
  deleteParliament,
};
