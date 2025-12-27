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

// @desc    Cleanup duplicates
// @route   GET /api/assembly-issues/cleanup
// @access  Private (Admin only ideally, but using view permission for now)
const cleanupDuplicates = async (req, res) => {
  try {
    const issues = await AssemblyIssue.find({}).sort({ createdAt: -1 });
    const seen = new Map();
    const toDelete = [];

    for (const issue of issues) {
      if (seen.has(issue.uniqueId)) {
        toDelete.push(issue._id);
      } else {
        seen.set(issue.uniqueId, true);
      }
    }

    if (toDelete.length > 0) {
      await AssemblyIssue.deleteMany({ _id: { $in: toDelete } });
    }

    res.json({
      success: true,
      message: `Cleaned up ${toDelete.length} duplicates.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed assembly issues
// @route   GET /api/assembly-issues/seed
// @access  Public (Temporary)
const seedAssemblyIssues = async (req, res) => {
  try {
    await AssemblyIssue.deleteMany({});

    const sampleIssues = [];
    const blocks = ["Gandhwani", "Tirla", "Bagh", "Kukshi", "Manawar", "Dhar"];
    const sectors = [
      "GANDHWANI",
      "BILDA",
      "Anjanai",
      "PIPLI",
      "ZEERABAD",
      "BAGH",
    ];
    const microSectors = ["GGR", "GBI", "TA", "GP", "MZ", "BG"];
    const villages = [
      "Kundi",
      "Chikli",
      "Kodi",
      "Soyla",
      "Bori",
      "Pipli",
      "Rehda",
      "Jeerabad",
    ];
    const faliyas = [
      "DavarPura",
      "Khadapura",
      "HanumanPura",
      "Baydipura",
      "Moryapura",
      "PatelPura",
    ];
    const gramPanchayats = [
      "Rehda",
      "Chikli",
      "Pithanpur",
      "Soyla",
      "Bori",
      "Pipli",
    ];
    const boothNames = [
      "Primary School",
      "Middle School",
      "High School",
      "Community Hall",
      "Panchayat Bhavan",
    ];

    for (let i = 1; i <= 150; i++) {
      const block = blocks[Math.floor(Math.random() * blocks.length)];
      const sector = sectors[Math.floor(Math.random() * sectors.length)];
      const village = villages[Math.floor(Math.random() * villages.length)];
      const faliya = faliyas[Math.floor(Math.random() * faliyas.length)];
      const gp =
        gramPanchayats[Math.floor(Math.random() * gramPanchayats.length)];
      const booth = boothNames[Math.floor(Math.random() * boothNames.length)];
      const msCode =
        microSectors[Math.floor(Math.random() * microSectors.length)];
      const msNo = `${msCode} ${Math.floor(Math.random() * 20) + 1}`;

      sampleIssues.push({
        uniqueId: `GS/${170 + i}`,
        year: Math.random() > 0.3 ? "2025" : "2024",
        acMpNo: "N/A",
        block: block,
        sector: sector,
        microSectorNo: msNo,
        microSectorName: `${sector} MS ${Math.floor(Math.random() * 10) + 1}`,
        boothName: `${booth} ${village}`,
        boothNo: (Math.floor(Math.random() * 300) + 1).toString(),
        gramPanchayat: gp,
        village: village,
        faliya: faliya,
        totalMembers: Math.floor(Math.random() * 50),
        file: "",
      });
    }

    await AssemblyIssue.insertMany(sampleIssues);

    res.json({
      success: true,
      message: `Seeded ${sampleIssues.length} issues successfully`,
    });
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
  cleanupDuplicates,
  seedAssemblyIssues,
};
