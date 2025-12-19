const Project = require("../models/projectModel");

// @desc    Get all projects
// @route   GET /api/projects
const getProjects = async (req, res) => {
  try {
    const {
      block,
      department,
      status,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (block) query.block = block;
    if (department) query.department = department;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { workName: { $regex: search, $options: "i" } },
        { district: { $regex: search, $options: "i" } },
        { officerName: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let projects;
    let filteredCount;
    let totalCount = await Project.countDocuments({});

    if (limitNum === -1) {
      projects = await Project.find(query).sort({ createdAt: -1 });
      filteredCount = projects.length;
    } else {
      const skip = (pageNum - 1) * limitNum;
      projects = await Project.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);
      filteredCount = await Project.countDocuments(query);
    }

    res.json({
      success: true,
      data: projects,
      count: totalCount,
      filteredCount: filteredCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
const createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, data: updatedProject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    await project.deleteOne();
    res.json({ success: true, message: "Project removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed projects
// @route   POST /api/projects/seed
const seedProjects = async (req, res) => {
  try {
    await Project.deleteMany();
    const projects = Array.from({ length: 50 }).map((_, i) => ({
      district: i % 2 === 0 ? "Dhar" : "Indore",
      block: i % 3 === 0 ? "Bagh" : "Tanda",
      department: i % 2 === 0 ? "PWD" : "Education",
      workName: `Project Work ${i + 1} - Road Construction`,
      projectCost: (i + 1) * 100000,
      proposalEstimate: (i + 1) * 120000,
      tsNoDate: `TS-${100 + i}/2025`,
      asNoDate: `AS-${500 + i}/2025`,
      status: i % 4 === 0 ? "Completed" : "In Progress",
      officerName: `Officer ${String.fromCharCode(65 + (i % 26))}`,
      contactNumber: "9876543210",
      remarks: "Sample remark for project",
    }));

    await Project.insertMany(projects);
    res.json({ success: true, message: "Seeded 50 projects" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  seedProjects,
};
