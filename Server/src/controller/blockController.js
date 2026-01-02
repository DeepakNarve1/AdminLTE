const Block = require("../models/blockModel");

// @desc    Get all blocks
// @route   GET /api/blocks
const getBlocks = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, assembly } = req.query;

    const query = {};

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    if (assembly) {
      query.assembly = assembly;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let blocks;
    let filteredCount;
    let totalCount = await Block.countDocuments({});

    if (limitNum === -1) {
      blocks = await Block.find(query)
        .populate("assembly", "name")
        .sort({ name: 1 });
      filteredCount = blocks.length;
    } else {
      const skip = (pageNum - 1) * limitNum;
      blocks = await Block.find(query)
        .populate("assembly", "name")
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum);
      filteredCount = await Block.countDocuments(query);
    }

    res.json({
      success: true,
      data: blocks,
      count: totalCount,
      filteredCount: filteredCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single block
// @route   GET /api/blocks/:id
const getBlockById = async (req, res) => {
  try {
    const block = await Block.findById(req.params.id).populate(
      "assembly",
      "name"
    );
    if (!block) {
      return res.status(404).json({ message: "Block not found" });
    }
    const Booth = require("../models/boothModel");
    const booths = await Booth.find({ block: block._id });

    res.json({ success: true, data: { ...block.toObject(), booths } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a block
// @route   POST /api/blocks
const createBlock = async (req, res) => {
  try {
    const { name, assembly, booths } = req.body;
    const block = await Block.create({ name, assembly });

    if (booths && Array.isArray(booths) && booths.length > 0) {
      const Booth = require("../models/boothModel");
      const boothsToInsert = booths
        .filter((d) => d && (d.name || d.code))
        .map((d) => ({
          name: d.name || d, // allow simple string array or object array? "booths" in prompt usually implies simple list if previous pattern holds, but Booth has name AND code.
          // previous controllers assumed simple string list for children "name: d".
          // Booth has `name` and `code`.
          // If we want to support creating booths here, we need to know the structure.
          // I'll assume simple string for name for now, or handle object.
          // Ideally booths should be created separately or handle objects here.
          // Let's support object {name, code} or string (name only).
          // But strict simple string implementation from previous files: .map(d => ({name: d, ...}))
          // Booth has `code`. I'll assume if string -> name. if object -> name/code.
          name: typeof d === "string" ? d : d.name,
          code: typeof d === "object" ? d.code : undefined,
          block: block._id,
        }));
      if (boothsToInsert.length > 0) {
        await Booth.insertMany(boothsToInsert);
      }
    }

    res.status(201).json({ success: true, data: block });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a block
// @route   PUT /api/blocks/:id
const updateBlock = async (req, res) => {
  try {
    const block = await Block.findById(req.params.id);
    if (!block) {
      return res.status(404).json({ message: "Block not found" });
    }
    const updatedBlock = await Block.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    const { booths } = req.body;
    if (booths && Array.isArray(booths) && booths.length > 0) {
      const Booth = require("../models/boothModel");
      const boothsToInsert = booths
        .filter((d) => d && (d.name || d.code || typeof d === "string"))
        .map((d) => ({
          name: typeof d === "string" ? d : d.name,
          code: typeof d === "object" ? d.code : undefined,
          block: updatedBlock._id,
        }));
      if (boothsToInsert.length > 0) {
        await Booth.insertMany(boothsToInsert);
      }
    }

    res.json({ success: true, data: updatedBlock });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a block
// @route   DELETE /api/blocks/:id
const deleteBlock = async (req, res) => {
  try {
    const block = await Block.findById(req.params.id);
    if (!block) {
      return res.status(404).json({ message: "Block not found" });
    }
    await block.deleteOne();
    res.json({ success: true, message: "Block removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBlocks,
  getBlockById,
  createBlock,
  updateBlock,
  deleteBlock,
};
