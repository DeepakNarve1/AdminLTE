const AssemblyIssue = require("../models/assemblyIssueModel");

// @desc    Get all assembly issues
// @route   GET /api/assembly-issues
// @access  Private
const getAssemblyIssues = async (req, res) => {
  try {
    const {
      status,
      priority,
      assembly,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter query
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assembly) query.assembly = assembly;

    if (search) {
      query.$or = [
        { uniqueId: { $regex: search, $options: "i" } },
        { block: { $regex: search, $options: "i" } },
        { village: { $regex: search, $options: "i" } },
        { boothName: { $regex: search, $options: "i" } },
        { gramPanchayat: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let issues;
    let filteredCount;
    let totalCount;

    // Always get the true total (unfiltered)
    totalCount = await AssemblyIssue.countDocuments({});

    if (limitNum === -1) {
      // Return all filtered records (no pagination)
      issues = await AssemblyIssue.find(query).sort({ createdAt: -1 });
      filteredCount = issues.length;
    } else {
      const skip = (pageNum - 1) * limitNum;
      issues = await AssemblyIssue.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      filteredCount = await AssemblyIssue.countDocuments(query);
    }

    res.json({
      success: true,
      data: issues,
      count: totalCount,
      filteredCount: filteredCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single assembly issue
// @route   GET /api/assembly-issues/:id
// @access  Private
const getAssemblyIssueById = async (req, res) => {
  try {
    const issue = await AssemblyIssue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }
    res.json({ success: true, data: issue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create assembly issue
// @route   POST /api/assembly-issues
// @access  Private
const createAssemblyIssue = async (req, res) => {
  try {
    const issue = await AssemblyIssue.create(req.body);
    res.status(201).json({ success: true, data: issue });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Unique ID number already exists" });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update assembly issue
// @route   PUT /api/assembly-issues/:id
// @access  Private
const updateAssemblyIssue = async (req, res) => {
  try {
    const issue = await AssemblyIssue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }
    const updatedIssue = await AssemblyIssue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, data: updatedIssue });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Unique ID number already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete assembly issue
// @route   DELETE /api/assembly-issues/:id
// @access  Private
const deleteAssemblyIssue = async (req, res) => {
  try {
    const issue = await AssemblyIssue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }
    await issue.deleteOne();
    res.json({ success: true, message: "Issue removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAssemblyIssues,
  getAssemblyIssueById,
  createAssemblyIssue,
  updateAssemblyIssue,
  deleteAssemblyIssue,
};
