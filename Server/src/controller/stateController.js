const State = require("../models/stateModel");

// @desc    Get all states
// @route   GET /api/states
const getStates = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let states;
    let filteredCount;
    let totalCount = await State.countDocuments({});

    if (limitNum === -1) {
      states = await State.find(query).sort({ name: 1 });
      filteredCount = states.length;
    } else {
      const skip = (pageNum - 1) * limitNum;
      states = await State.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum);
      filteredCount = await State.countDocuments(query);
    }

    res.json({
      success: true,
      data: states,
      count: totalCount,
      filteredCount: filteredCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single state
// @route   GET /api/states/:id
const getStateById = async (req, res) => {
  try {
    const state = await State.findById(req.params.id);
    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }
    res.json({ success: true, data: state });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a state
// @route   POST /api/states
const createState = async (req, res) => {
  try {
    const state = await State.create(req.body);
    res.status(201).json({ success: true, data: state });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a state
// @route   PUT /api/states/:id
const updateState = async (req, res) => {
  try {
    const state = await State.findById(req.params.id);
    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }
    const updatedState = await State.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: updatedState });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a state
// @route   DELETE /api/states/:id
const deleteState = async (req, res) => {
  try {
    const state = await State.findById(req.params.id);
    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }
    await state.deleteOne();
    res.json({ success: true, message: "State removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStates,
  getStateById,
  createState,
  updateState,
  deleteState,
};
