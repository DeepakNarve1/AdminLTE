const Assembly = require("../models/assemblyModel");

// @desc    Get all assemblies
// @route   GET /api/assemblies
const getAssemblies = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, parliament } = req.query;

    const query = {};

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    if (parliament) {
      query.parliament = parliament;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let assemblies;
    let filteredCount;
    let totalCount = await Assembly.countDocuments({});

    if (limitNum === -1) {
      assemblies = await Assembly.find(query)
        .populate("parliament", "name")
        .sort({ name: 1 });
      filteredCount = assemblies.length;
    } else {
      const skip = (pageNum - 1) * limitNum;
      assemblies = await Assembly.find(query)
        .populate("parliament", "name")
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum);
      filteredCount = await Assembly.countDocuments(query);
    }

    res.json({
      success: true,
      data: assemblies,
      count: totalCount,
      filteredCount: filteredCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single assembly
// @route   GET /api/assemblies/:id
const getAssemblyById = async (req, res) => {
  try {
    const assembly = await Assembly.findById(req.params.id).populate(
      "parliament",
      "name"
    );
    if (!assembly) {
      return res.status(404).json({ message: "Assembly not found" });
    }
    const Block = require("../models/blockModel");
    const blocks = await Block.find({ assembly: assembly._id });

    res.json({ success: true, data: { ...assembly.toObject(), blocks } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an assembly
// @route   POST /api/assemblies
const createAssembly = async (req, res) => {
  try {
    const { name, parliament, blocks } = req.body;
    const assembly = await Assembly.create({ name, parliament });

    if (blocks && Array.isArray(blocks) && blocks.length > 0) {
      const Block = require("../models/blockModel");
      const blocksToInsert = blocks
        .filter((d) => d && d.trim() !== "")
        .map((d) => ({
          name: d,
          assembly: assembly._id,
        }));
      if (blocksToInsert.length > 0) {
        await Block.insertMany(blocksToInsert);
      }
    }

    res.status(201).json({ success: true, data: assembly });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an assembly
// @route   PUT /api/assemblies/:id
const updateAssembly = async (req, res) => {
  try {
    const assembly = await Assembly.findById(req.params.id);
    if (!assembly) {
      return res.status(404).json({ message: "Assembly not found" });
    }
    const updatedAssembly = await Assembly.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    const { blocks } = req.body;
    if (blocks && Array.isArray(blocks) && blocks.length > 0) {
      const Block = require("../models/blockModel");
      const blocksToInsert = blocks
        .filter((d) => d && d.trim() !== "")
        .map((d) => ({
          name: d,
          assembly: updatedAssembly._id,
        }));
      if (blocksToInsert.length > 0) {
        await Block.insertMany(blocksToInsert);
      }
    }

    res.json({ success: true, data: updatedAssembly });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an assembly
// @route   DELETE /api/assemblies/:id
const deleteAssembly = async (req, res) => {
  try {
    const assembly = await Assembly.findById(req.params.id);
    if (!assembly) {
      return res.status(404).json({ message: "Assembly not found" });
    }
    await assembly.deleteOne();
    res.json({ success: true, message: "Assembly removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAssemblies,
  getAssemblyById,
  createAssembly,
  updateAssembly,
  deleteAssembly,
};
