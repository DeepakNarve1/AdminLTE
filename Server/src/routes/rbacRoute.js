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

const router = express.Router();

// Permission routes
router.get("/permissions", protect, getAllPermissions);
router.post("/permissions", protect, createPermission);

// Role routes
router.get("/roles", protect, getAllRoles);
router.get("/roles/:id", protect, getRoleById);
router.post("/roles", protect, createRole);
router.put("/roles/:id", protect, updateRole);
router.delete("/roles/:id", protect, deleteRole);

// Sidebar access routes
router.get("/sidebar-permissions", protect, getSidebarAccess);
router.put("/sidebar-permissions", protect, upsertSidebarAccess);

module.exports = router;
