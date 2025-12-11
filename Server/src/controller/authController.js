const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register User
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, mobile, userType, block } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "employee",
      permissions: {},
      mobile: mobile || "",
      userType: userType || "",
      block: block || "",
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        userType: user.userType,
        block: user.block,
        token: generateToken(user.id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (exclude superadmin accounts)
exports.getUsers = async (req, res, next) => {
  try {
    // exclude users with role 'superadmin' from the listing
    const users = await User.find({ role: { $ne: "superadmin" } }).select(
      "-password"
    );
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by id
// @route   GET /api/auth/users/:id
// @access  Private (admin/superadmin)
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  // never reveal superadmin via this endpoint either
  if (user.role === "superadmin") {
    res.status(403);
    throw new Error("Access denied");
  }
  res.json({ success: true, data: user });
});

// @desc    Update user
// @route   PUT /api/auth/users/:id
// @access  Private (admin/superadmin)
exports.updateUser = asyncHandler(async (req, res) => {
  // only admins or superadmins can update users
  if (
    !req.user ||
    (req.user.role !== "admin" && req.user.role !== "superadmin")
  ) {
    res.status(403);
    throw new Error("Not authorized to update users");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "superadmin") {
    res.status(403);
    throw new Error("Cannot modify superadmin");
  }

  const { name, email, role, mobile, userType, block } = req.body;
  user.name = name ?? user.name;
  user.email = email ?? user.email;
  user.role = role ?? user.role;
  user.mobile = mobile ?? user.mobile;
  user.userType = userType ?? user.userType;
  user.block = block ?? user.block;

  const updated = await user.save();
  res.json({ success: true, data: { ...updated._doc, password: undefined } });
});

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private (admin/superadmin)
exports.deleteUser = asyncHandler(async (req, res) => {
  if (
    !req.user ||
    (req.user.role !== "admin" && req.user.role !== "superadmin")
  ) {
    res.status(403);
    throw new Error("Not authorized to delete users");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "superadmin") {
    res.status(403);
    throw new Error("Cannot delete superadmin account");
  }

  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "User removed" });
});

// Login User
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          token: generateToken(user.id),
          user: {
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            mobile: user.mobile,
            userType: user.userType,
            block: user.block,
          },
        },
      });
    } else {
      res.status(401);
      return next(new Error("Invalid email or password"));
    }
  } catch (error) {
    next(error);
  }
};
