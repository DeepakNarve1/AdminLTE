const express = require("express");
const {
  getAllPermissions,
  createPermission,
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignPermissionToRole,
  removePermissionFromRole,
} = require("../controller/rbacController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

// All RBAC routes require authentication
router.use(protect);

// ==================== PERMISSIONS ====================
router.get("/permissions", getAllPermissions);
router.post("/permissions", createPermission);

// ==================== ROLES ====================
router.get("/roles", getAllRoles);
router.get("/roles/:id", getRoleById);
router.post("/roles", createRole);
router.put("/roles/:id", updateRole);
router.delete("/roles/:id", deleteRole);

// Role-Permission Management
router.post("/roles/:id/permissions", assignPermissionToRole);
router.delete("/roles/:id/permissions/:permissionId", removePermissionFromRole);

module.exports = router;
