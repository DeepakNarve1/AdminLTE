const asyncHandler = require("express-async-handler");
const Role = require("../models/roleModel");

// @desc    Check if user has specific permission
// @param   {string} permissionName - The permission to check (e.g., "view_users", "delete_users")
// @returns {function} Middleware function
const checkPermission = (permissionName) => {
  return asyncHandler(async (req, res, next) => {
    // Superadmin has all permissions
    if (req.user && req.user.role === "superadmin") {
      return next();
    }

    // Get user's role with permissions populated
    const userRole = await Role.findOne({ name: req.user.role }).populate(
      "permissions",
      "name"
    );

    if (!userRole) {
      res.status(403);
      throw new Error("Role not found");
    }

    // Check if user has the required permission
    const hasPermission = userRole.permissions.some(
      (perm) => perm.name === permissionName
    );

    if (!hasPermission) {
      res.status(403);
      throw new Error(
        `You do not have permission to perform this action: ${permissionName}`
      );
    }

    next();
  });
};

// @desc    Check if user has one of multiple permissions
// @param   {array} permissionNames - Array of permissions (user needs at least one)
const checkAnyPermission = (permissionNames) => {
  return asyncHandler(async (req, res, next) => {
    // Superadmin has all permissions
    if (req.user && req.user.role === "superadmin") {
      return next();
    }

    const userRole = await Role.findOne({ name: req.user.role }).populate(
      "permissions",
      "name"
    );

    if (!userRole) {
      res.status(403);
      throw new Error("Role not found");
    }

    const userPermNames = userRole.permissions.map((p) => p.name);
    const hasAnyPermission = permissionNames.some((perm) =>
      userPermNames.includes(perm)
    );

    if (!hasAnyPermission) {
      res.status(403);
      throw new Error("You do not have the required permissions");
    }

    next();
  });
};

// @desc    Check if user has all required permissions
// @param   {array} permissionNames - Array of permissions (user needs all)
const checkAllPermissions = (permissionNames) => {
  return asyncHandler(async (req, res, next) => {
    // Superadmin has all permissions
    if (req.user && req.user.role === "superadmin") {
      return next();
    }

    const userRole = await Role.findOne({ name: req.user.role }).populate(
      "permissions",
      "name"
    );

    if (!userRole) {
      res.status(403);
      throw new Error("Role not found");
    }

    const userPermNames = userRole.permissions.map((p) => p.name);
    const hasAllPermissions = permissionNames.every((perm) =>
      userPermNames.includes(perm)
    );

    if (!hasAllPermissions) {
      res.status(403);
      throw new Error("You do not have all required permissions");
    }

    next();
  });
};

module.exports = {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
};
