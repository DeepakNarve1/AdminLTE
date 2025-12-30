const express = require("express");
const {
  registerUser,
  loginUser,
  googleLogin,
  getUsers,
  getUserById,
  getCurrentUser,
  updateUser,
  deleteUser,
} = require("../controller/authController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);

// users listing & management with permission checks
router.get("/me", protect, getCurrentUser);
router.get("/users", protect, checkPermission("view_users"), getUsers);
router.get("/users/:id", protect, checkPermission("view_users"), getUserById);
router.put("/users/:id", protect, checkPermission("edit_users"), updateUser);
router.delete(
  "/users/:id",
  protect,
  checkPermission("delete_users"),
  deleteUser
);

module.exports = router;
