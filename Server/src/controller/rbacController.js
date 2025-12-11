const asyncHandler = require("express-async-handler");
const Permission = require("../models/permissionModel");
const Role = require("../models/roleModel");

// ==================== PERMISSIONS ====================

// @desc    Get all permissions
// @route   GET /api/rbac/permissions
// @access  Private (admin/superadmin)
exports.getAllPermissions = asyncHandler(async (req, res) => {
  const permissions = await Permission.find().sort({ category: 1, name: 1 });
  res.json({ success: true, data: permissions });
});

// @desc    Create new permission
// @route   POST /api/rbac/permissions
// @access  Private (superadmin only)
exports.createPermission = asyncHandler(async (req, res) => {
  if (req.user.role !== "superadmin") {
    res.status(403);
    throw new Error("Not authorized to create permissions");
  }

  const { name, displayName, description, category } = req.body;

  if (!name || !displayName) {
    res.status(400);
    throw new Error("Name and displayName are required");
  }

  const permission = await Permission.create({
    name: name.toLowerCase(),
    displayName,
    description,
    category: category || "other",
  });

  res.status(201).json({ success: true, data: permission });
});

// ==================== ROLES ====================

// @desc    Get all roles with permissions
// @route   GET /api/rbac/roles
// @access  Private (admin/superadmin)
exports.getAllRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find()
    .populate("permissions", "name displayName description category")
    .sort({ isSystem: -1, name: 1 });
  res.json({ success: true, data: roles });
});

// @desc    Get single role by ID
// @route   GET /api/rbac/roles/:id
// @access  Private (admin/superadmin)
exports.getRoleById = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id).populate(
    "permissions",
    "name displayName description category"
  );

  if (!role) {
    res.status(404);
    throw new Error("Role not found");
  }

  res.json({ success: true, data: role });
});

// @desc    Create new role
// @route   POST /api/rbac/roles
// @access  Private (superadmin only)
exports.createRole = asyncHandler(async (req, res) => {
  if (req.user.role !== "superadmin") {
    res.status(403);
    throw new Error("Not authorized to create roles");
  }

  const { name, displayName, description, permissions } = req.body;

  if (!name || !displayName) {
    res.status(400);
    throw new Error("Name and displayName are required");
  }

  // Validate permissions exist
  if (permissions && permissions.length > 0) {
    const perms = await Permission.find({ _id: { $in: permissions } });
    if (perms.length !== permissions.length) {
      res.status(400);
      throw new Error("Some permissions do not exist");
    }
  }

  const role = await Role.create({
    name: name.toLowerCase(),
    displayName,
    description,
    permissions: permissions || [],
    isSystem: false,
  });

  await role.populate("permissions", "name displayName description category");

  res.status(201).json({ success: true, data: role });
});

// @desc    Update role and its permissions
// @route   PUT /api/rbac/roles/:id
// @access  Private (superadmin only)
exports.updateRole = asyncHandler(async (req, res) => {
  if (req.user.role !== "superadmin") {
    res.status(403);
    throw new Error("Not authorized to update roles");
  }

  const role = await Role.findById(req.params.id);

  if (!role) {
    res.status(404);
    throw new Error("Role not found");
  }

  // Cannot modify system roles
  if (role.isSystem) {
    res.status(403);
    throw new Error("Cannot modify system roles");
  }

  const { displayName, description, permissions } = req.body;

  role.displayName = displayName ?? role.displayName;
  role.description = description ?? role.description;

  // Update permissions if provided
  if (permissions) {
    const perms = await Permission.find({ _id: { $in: permissions } });
    if (perms.length !== permissions.length) {
      res.status(400);
      throw new Error("Some permissions do not exist");
    }
    role.permissions = permissions;
  }

  const updated = await role.save();
  await updated.populate(
    "permissions",
    "name displayName description category"
  );

  res.json({ success: true, data: updated });
});

// @desc    Delete role
// @route   DELETE /api/rbac/roles/:id
// @access  Private (superadmin only)
exports.deleteRole = asyncHandler(async (req, res) => {
  if (req.user.role !== "superadmin") {
    res.status(403);
    throw new Error("Not authorized to delete roles");
  }

  const role = await Role.findById(req.params.id);

  if (!role) {
    res.status(404);
    throw new Error("Role not found");
  }

  // Cannot delete system roles
  if (role.isSystem) {
    res.status(403);
    throw new Error("Cannot delete system roles");
  }

  await Role.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: "Role deleted successfully" });
});

// @desc    Assign permission to role
// @route   POST /api/rbac/roles/:id/permissions
// @access  Private (superadmin only)
exports.assignPermissionToRole = asyncHandler(async (req, res) => {
  if (req.user.role !== "superadmin") {
    res.status(403);
    throw new Error("Not authorized");
  }

  const { permissionId } = req.body;

  if (!permissionId) {
    res.status(400);
    throw new Error("Permission ID is required");
  }

  const role = await Role.findById(req.params.id);
  if (!role) {
    res.status(404);
    throw new Error("Role not found");
  }

  const permission = await Permission.findById(permissionId);
  if (!permission) {
    res.status(404);
    throw new Error("Permission not found");
  }

  // Add permission if not already present
  if (!role.permissions.includes(permissionId)) {
    role.permissions.push(permissionId);
    await role.save();
  }

  await role.populate("permissions", "name displayName description category");

  res.json({ success: true, data: role });
});

// @desc    Remove permission from role
// @route   DELETE /api/rbac/roles/:id/permissions/:permissionId
// @access  Private (superadmin only)
exports.removePermissionFromRole = asyncHandler(async (req, res) => {
  if (req.user.role !== "superadmin") {
    res.status(403);
    throw new Error("Not authorized");
  }

  const { id, permissionId } = req.params;

  const role = await Role.findById(id);
  if (!role) {
    res.status(404);
    throw new Error("Role not found");
  }

  role.permissions = role.permissions.filter(
    (p) => p.toString() !== permissionId
  );
  await role.save();

  await role.populate("permissions", "name displayName description category");

  res.json({ success: true, data: role });
});
