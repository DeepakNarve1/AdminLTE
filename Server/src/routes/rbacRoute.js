const express = require("express");
const {
  getAllPermissions,
  createPermission,
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getSidebarAccess,
  upsertSidebarAccess,
} = require("../controller/rbacController");
const protect = require("../middleware/authMiddleware");
const {
  checkPermission,
  checkAnyPermission,
} = require("../middleware/permissionMiddleware");

const router = express.Router();

// Permission routes - only superadmin/admin can manage
router.get(
  "/permissions",
  protect,
  checkAnyPermission(["manage_roles", "view_roles"]),
  getAllPermissions
);
router.post(
  "/permissions",
  protect,
  checkPermission("manage_roles"),
  createPermission
);

// Role routes - only superadmin/admin can manage
router.get(
  "/roles",
  protect,
  checkAnyPermission(["manage_roles", "view_roles"]),
  getAllRoles
);
router.get(
  "/roles/:id",
  protect,
  checkAnyPermission(["manage_roles", "view_roles"]),
  getRoleById
);
router.post(
  "/roles",
  protect,
  checkAnyPermission(["manage_roles", "create_roles"]),
  createRole
);
router.put(
  "/roles/:id",
  protect,
  checkAnyPermission(["manage_roles", "edit_roles"]),
  updateRole
);
router.delete(
  "/roles/:id",
  protect,
  checkAnyPermission(["manage_roles", "delete_roles"]),
  deleteRole
);

// Sidebar RBAC routes
router.get("/sidebar-permissions", protect, getSidebarAccess);
router.put(
  "/sidebar-permissions",
  protect,
  checkPermission("manage_roles"),
  upsertSidebarAccess
);

module.exports = router;
