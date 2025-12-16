const Role = require("../models/roleModel");
const Permission = require("../models/permissionModel");

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
    const { name, displayName, description, permissions, sidebarAccess } =
      req.body;

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
      sidebarAccess: sidebarAccess || [],
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
    const { name, displayName, description, permissions, sidebarAccess } =
      req.body;

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
    role.sidebarAccess = sidebarAccess || role.sidebarAccess;

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

// Get sidebar permissions map
// Get sidebar permissions map
exports.getSidebarAccess = async (req, res) => {
  try {
    const roles = await Role.find().select("name sidebarAccess");

    const accessMap = {};
    roles.forEach((role) => {
      if (role?.name) {
        accessMap[role.name] = role.sidebarAccess || [];
      }
    });

    // Ensure superadmin always has full access (wildcard)
    // This is server-side protection in case DB is missing it.
    accessMap.superadmin = ["*"];

    res.status(200).json({
      success: true,
      data: accessMap,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update sidebar permissions map
// Update sidebar permissions map
exports.upsertSidebarAccess = async (req, res) => {
  try {
    const accessMap = req.body; // { roleName: [paths...] }

    if (!accessMap || typeof accessMap !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid access map format",
      });
    }

    // Force superadmin wildcard and prevent accidental modification from client
    accessMap.superadmin = ["*"];

    const updates = Object.entries(accessMap).map(([roleName, paths]) =>
      Role.findOneAndUpdate(
        { name: roleName },
        { sidebarAccess: Array.isArray(paths) ? paths : [] },
        { new: true, upsert: false } // don't create new roles here
      )
    );

    await Promise.all(updates);

    res.status(200).json({
      success: true,
      message: "Sidebar permissions updated successfully",
      data: accessMap,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
