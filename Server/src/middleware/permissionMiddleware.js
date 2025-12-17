const asyncHandler = require("express-async-handler");

// @desc    Check if user has a specific permission
const checkPermission = (permissionName) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.role) {
      res.status(403);
      throw new Error("User or role not found");
    }

    // Superadmin has all permissions
    if (req.user.role === "superadmin" || (req.user.role && req.user.role.name === "superadmin")) {
      return next();
    }

    // Permissions should already be populated in req.user.role
    const userPermNames = req.user.role.permissions.map((p) => p.name);
    if (!userPermNames.includes(permissionName)) {
      res.status(403);
      throw new Error(`You do not have permission: ${permissionName}`);
    }

    next();
  });
};

// Check any permission
const checkAnyPermission = (permissionNames) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.role) {
      res.status(403);
      throw new Error("User or role not found");
    }

    if (req.user.role.name === "superadmin") {
      return next();
    }

    const userPermNames = req.user.role.permissions.map((p) => p.name);
    const hasAny = permissionNames.some((perm) => userPermNames.includes(perm));

    if (!hasAny) {
      res.status(403);
      throw new Error("You do not have any of the required permissions");
    }

    next();
  });
};

// Check all permissions
const checkAllPermissions = (permissionNames) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.role) {
      res.status(403);
      throw new Error("User or role not found");
    }

    if (req.user.role.name === "superadmin") {
      return next();
    }

    const userPermNames = req.user.role.permissions.map((p) => p.name);
    const hasAll = permissionNames.every((perm) =>
      userPermNames.includes(perm)
    );

    if (!hasAll) {
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
