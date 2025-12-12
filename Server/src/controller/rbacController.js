const Role = require("../models/roleModel");
const Permission = require("../models/permissionModel");
const SidebarAccess = require("../models/sidebarAccessModel");

// ==================== PERMISSION CONTROLLERS ====================

// Get all permissions
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create permission
exports.createPermission = async (req, res) => {
  try {
    const { name, displayName, description, category } = req.body;

    if (!name || !displayName) {
      return res.status(400).json({
        success: false,
        message: "Name and displayName are required",
      });
    }

    const permission = await Permission.create({
      name,
      displayName,
      description,
      category,
    });

    res.status(201).json({
      success: true,
      data: permission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== ROLE CONTROLLERS ====================

// Get all roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().populate("permissions");

    // Format the response to match what the frontend expects
    const formattedRoles = roles.map((role) => ({
      _id: role._id,
      role: role.name,
      status: role.isSystem ? "System" : "Custom",
      createdAt: role.createdAt,
      ...role.toObject(),
    }));

    res.status(200).json({
      success: true,
      data: formattedRoles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single role by id
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).populate("permissions");

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create role
exports.createRole = async (req, res) => {
  try {
    const { name, displayName, description, permissions } = req.body;

    if (!name || !displayName) {
      return res.status(400).json({
        success: false,
        message: "Name and displayName are required",
      });
    }

    const role = await Role.create({
      name,
      displayName,
      description,
      permissions: permissions || [],
    });

    res.status(201).json({
      success: true,
      data: role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  try {
    const { name, displayName, description, permissions } = req.body;

    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Prevent updating system roles
    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        message: "Cannot update system roles",
      });
    }

    role.name = name || role.name;
    role.displayName = displayName || role.displayName;
    role.description = description || role.description;
    role.permissions = permissions || role.permissions;

    await role.save();

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Prevent deletion of system roles
    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete system roles",
      });
    }

    await Role.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== SIDEBAR ACCESS CONTROLLERS ====================

// Get sidebar access map { role: [paths] }
exports.getSidebarAccess = async (_req, res) => {
  try {
    const records = await SidebarAccess.find();
    const map = {};
    records.forEach((rec) => {
      map[rec.role] = rec.paths || [];
    });
    return res.status(200).json({ success: true, data: map });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message || "Failed to load sidebar access" });
  }
};

// Upsert sidebar access map { role: [paths] }
exports.upsertSidebarAccess = async (req, res) => {
  try {
    const accessMap = req.body || {};

    if (typeof accessMap !== "object" || Array.isArray(accessMap)) {
      return res
        .status(400)
        .json({ success: false, message: "Payload must be an object of role -> paths[]" });
    }

    const bulkOps = Object.entries(accessMap).map(([role, paths]) => ({
      updateOne: {
        filter: { role: role.toLowerCase() },
        update: { role: role.toLowerCase(), paths: Array.isArray(paths) ? paths : [] },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await SidebarAccess.bulkWrite(bulkOps);
    }

    return res.status(200).json({ success: true, message: "Sidebar access updated" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message || "Failed to update sidebar access" });
  }
};
