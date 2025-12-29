const Member = require("../models/memberModel");
const asyncHandler = require("express-async-handler");

// @desc    Get members
// @route   GET /api/members
// @access  Private
const getMembers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit,
    search,
    block,
    year,
    vehicle,
    samiti,
    code,
  } = req.query;

  const query = {};

  // Text Search
  if (search) {
    query.$or = [
      { block: { $regex: search, $options: "i" } },
      { samiti: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
    ];
  }

  // Filters
  if (block && block !== "All") query.block = block;
  if (year && year !== "All") query.year = year;
  if (vehicle && vehicle !== "All") query.vehicle = vehicle;
  if (samiti && samiti !== "All") query.samiti = samiti;
  if (code && code !== "All") query.code = code;

  const pageNum = parseInt(page) || 1;
  // Parse limit: if not provided or invalid, default to 10
  // If explicitly -1, keep it as -1 for "all" entries
  let limitNum = 10;
  if (limit !== undefined && limit !== null && limit !== "") {
    const parsedLimit = parseInt(limit);
    if (!isNaN(parsedLimit)) {
      limitNum = parsedLimit;
    }
  }

  let queryBuilder = Member.find(query).sort({ createdAt: -1 });

  // Pagination - if limit is -1, fetch all records
  if (limitNum !== -1) {
    const skip = (pageNum - 1) * limitNum;
    queryBuilder = queryBuilder.skip(skip).limit(limitNum);
  }

  const members = await queryBuilder;
  const count = await Member.countDocuments(query);

  res.json({
    success: true,
    data: members,
    count: count,
    pagination: {
      page: pageNum,
      pages: limitNum === -1 ? 1 : Math.ceil(count / limitNum),
    },
  });
});

// @desc    Get member by ID
// @route   GET /api/members/:id
// @access  Private
const getMemberById = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (member) {
    res.json({ success: true, data: member });
  } else {
    res.status(404);
    throw new Error("Member not found");
  }
});

// @desc    Create a member
// @route   POST /api/members
// @access  Private
const createMember = asyncHandler(async (req, res) => {
  const {
    block,
    year,
    vehicle,
    samiti,
    code,
    instagram,
    twitter,
    startLat,
    startLong,
    startDate,
    endLat,
    endLong,
    endDate,
    image,
  } = req.body;

  const member = await Member.create({
    block,
    year,
    vehicle,
    samiti,
    code,
    instagram,
    twitter,
    startLat,
    startLong,
    startDate,
    endLat,
    endLong,
    endDate,
    image,
  });

  res.status(201).json({ success: true, data: member });
});

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private
const updateMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (member) {
    member.block = req.body.block || member.block;
    member.year = req.body.year || member.year;
    member.vehicle = req.body.vehicle || member.vehicle;
    member.samiti = req.body.samiti || member.samiti;
    member.code = req.body.code || member.code;
    member.instagram = req.body.instagram || member.instagram;
    member.twitter = req.body.twitter || member.twitter;
    member.startLat = req.body.startLat || member.startLat;
    member.startLong = req.body.startLong || member.startLong;
    member.startDate = req.body.startDate || member.startDate;
    member.endLat = req.body.endLat || member.endLat;
    member.endLong = req.body.endLong || member.endLong;
    member.endDate = req.body.endDate || member.endDate;
    member.image = req.body.image || member.image;

    const updatedMember = await member.save();
    res.json({ success: true, data: updatedMember });
  } else {
    res.status(404);
    throw new Error("Member not found");
  }
});

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private
const deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (member) {
    await member.deleteOne();
    res.json({ success: true, message: "Member removed" });
  } else {
    res.status(404);
    throw new Error("Member not found");
  }
});

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
};
