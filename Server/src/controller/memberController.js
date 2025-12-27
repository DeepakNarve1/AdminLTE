const Member = require("../models/memberModel");
const asyncHandler = require("express-async-handler");

// @desc    Get members
// @route   GET /api/members
// @access  Private
const getMembers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
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

  let queryBuilder = Member.find(query).sort({ createdAt: -1 });

  // Pagination
  if (limit !== "-1") {
    const skip = (Number(page) - 1) * Number(limit);
    queryBuilder = queryBuilder.skip(skip).limit(Number(limit));
  }

  const members = await queryBuilder;
  const count = await Member.countDocuments(query);

  res.json({
    success: true,
    data: members,
    count: count,
    pagination: {
      page: Number(page),
      pages: limit === "-1" ? 1 : Math.ceil(count / Number(limit)),
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
