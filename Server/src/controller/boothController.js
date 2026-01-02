const Booth = require("../models/boothModel");

// @desc    Get all booths
// @route   GET /api/booths
const getBooths = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, block } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    if (block) {
      query.block = block;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let booths;
    let filteredCount;
    let totalCount = await Booth.countDocuments({});

    if (limitNum === -1) {
      booths = await Booth.find(query)
        .populate("block", "name")
        .sort({ name: 1 });
      filteredCount = booths.length;
    } else {
      const skip = (pageNum - 1) * limitNum;
      booths = await Booth.find(query)
        .populate("block", "name")
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum);
      filteredCount = await Booth.countDocuments(query);
    }

    res.json({
      success: true,
      data: booths,
      count: totalCount,
      filteredCount: filteredCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single booth
// @route   GET /api/booths/:id
const getBoothById = async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id).populate("block", "name");
    if (!booth) {
      return res.status(404).json({ message: "Booth not found" });
    }
    res.json({ success: true, data: booth });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a booth
// @route   POST /api/booths
const createBooth = async (req, res) => {
  try {
    const booth = await Booth.create(req.body);
    res.status(201).json({ success: true, data: booth });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a booth
// @route   PUT /api/booths/:id
const updateBooth = async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id);
    if (!booth) {
      return res.status(404).json({ message: "Booth not found" });
    }
    const updatedBooth = await Booth.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: updatedBooth });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a booth
// @route   DELETE /api/booths/:id
const deleteBooth = async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id);
    if (!booth) {
      return res.status(404).json({ message: "Booth not found" });
    }
    await booth.deleteOne();
    res.json({ success: true, message: "Booth removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBooths,
  getBoothById,
  createBooth,
  updateBooth,
  deleteBooth,
};
