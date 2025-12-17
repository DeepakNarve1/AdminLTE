const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Role = require("../models/roleModel");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register User
exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, mobile, userType, block } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill all fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const newUser = await User.create({
    name,
    email,
    password,
    role, // ObjectId of Role
    mobile: mobile || "",
    userType: userType || "regularUser",
    block: block || "",
    permissions: {},
  });

  // Perform manual safe populate
  if (newUser.role && mongoose.Types.ObjectId.isValid(newUser.role)) {
     const roleDoc = await Role.findById(newUser.role).populate("permissions", "name displayName");
     if (roleDoc) {
       newUser.role = roleDoc;
     }
  }

  res.status(201).json({
    success: true,
    data: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      mobile: newUser.mobile,
      userType: newUser.userType,
      block: newUser.block,
      token: generateToken(newUser._id),
    },
  });
});

// Get all users (exclude superadmin accounts)
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .populate({
      path: "role",
      select: "name displayName permissions sidebarAccess",
    })
    .select("-password");

  // Filter out superadmins
  const filtered = users.filter((u) => u.role?.name !== "superadmin");

  res.json({ success: true, data: filtered });
});

// Get single user by ID
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate({
      path: "role",
      select: "name displayName permissions sidebarAccess",
      populate: { path: "permissions", select: "name displayName" },
    })
    .select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role?.name === "superadmin") {
    res.status(403);
    throw new Error("Access denied");
  }

  res.json({ success: true, data: user });
});

// Update User
exports.updateUser = asyncHandler(async (req, res) => {
  const roleName = req.user?.role?.name || req.user?.role;
  if (!req.user || !["admin", "superadmin"].includes(roleName)) {
    res.status(403);
    throw new Error("Not authorized to update users");
  }

  // Fetch user first allowing strings
  let user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role?.name === "superadmin") {
    res.status(403);
    throw new Error("Cannot modify superadmin");
  }

  const { name, email, role, mobile, userType, block } = req.body;

  user.name = name ?? user.name;
  user.email = email ?? user.email;
  if (role) user.role = role; // role should be ObjectId
  user.mobile = mobile ?? user.mobile;
  user.userType = userType ?? user.userType;
  user.block = block ?? user.block;

  const updated = await user.save();
  res.json({ success: true, data: { ...updated._doc, password: undefined } });
});

// Delete User
exports.deleteUser = asyncHandler(async (req, res) => {
  const roleName = req.user?.role?.name || req.user?.role;
  if (!req.user || !["admin", "superadmin", "super admin", "System Administrator", "system administrator"].includes(roleName)) {
    res.status(403);
    throw new Error("Not authorized to delete users");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const roleDoc = await Role.findById(user.role);
  if (roleDoc?.name === "superadmin") {
    res.status(403);
    throw new Error("Cannot delete superadmin account");
  }

  await user.remove();
  res.json({ success: true, message: "User removed" });
});

// Login User
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Fetch user document without populate first to allow string roles
  const user = await User.findOne({ email });

  // Manually populate role if it is an ObjectId
  if (user && user.role && mongoose.Types.ObjectId.isValid(user.role)) {
     const roleDoc = await Role.findById(user.role).populate("permissions", "name displayName");
     if (roleDoc) {
       user.role = roleDoc;
     }
  }

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    success: true,
    data: {
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        userType: user.userType,
        block: user.block,
      },
    },
  });
});
