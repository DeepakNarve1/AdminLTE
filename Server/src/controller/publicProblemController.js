const PublicProblem = require("../models/publicProblemModel");

// @desc    Get all public problems
// @route   GET /api/public-problems
// @access  Private
const getPublicProblems = async (req, res) => {
  try {
    const {
      block,
      year,
      month,
      department,
      status,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter query
    const query = {};

    if (block) query.block = block;
    if (year) query.year = year;
    if (month) query.month = month;
    if (department) query.department = department;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { regNo: { $regex: search, $options: "i" } },
        { district: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let problems;
    let filteredCount;
    let totalCount;

    // Always get the true total (unfiltered)
    totalCount = await PublicProblem.countDocuments({});

    if (limitNum === -1) {
      // Return all filtered records (no pagination)
      problems = await PublicProblem.find(query).sort({ createdAt: -1 });
      filteredCount = problems.length;
    } else {
      const skip = (pageNum - 1) * limitNum;
      problems = await PublicProblem.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      filteredCount = await PublicProblem.countDocuments(query);
    }

    res.json({
      success: true,
      data: problems,
      count: totalCount, // ← Total records in DB (unfiltered)
      filteredCount: filteredCount, // ← How many match current filters
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a public problem
// @route   POST /api/public-problems
const createPublicProblem = async (req, res) => {
  try {
    const problem = await PublicProblem.create(req.body);
    res.status(201).json({ success: true, data: problem });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Seed initial data
// @route   POST /api/public-problems/seed
const seedPublicProblems = async (req, res) => {
  try {
    await PublicProblem.deleteMany();

    const problems = Array.from({ length: 1250 }).map((_, i) => ({
      regNo: `MP/${416 - i}`,
      // Create dates going back 1 day per item to make timer interesting
      submissionDate: new Date(
        Date.now() - i * 24 * 60 * 60 * 1000 - i * 100000
      ),
      year: "2025",
      month: "November",
      dateString: "2025-11-28",
      district: i % 2 === 0 ? "Betul" : "Panna",
      assembly: "N/A",
      block: i % 3 === 0 ? "Bagh" : "Tanda", // Mix blocks for filtering
      recommendedLetterNo: "N/A",
      boothNo: String(100 + i),
      department: i % 2 === 0 ? "PWD" : "Health",
      status: i % 4 === 0 ? "Resolved" : "Pending",
    }));

    await PublicProblem.insertMany(problems);
    res.json({ success: true, message: "Seeded 25 problems" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPublicProblems,
  createPublicProblem,
  seedPublicProblems,
};
