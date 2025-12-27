const express = require("express");
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  seedEvents,
} = require("../controller/eventController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, checkPermission("view_events"), getEvents)
  .post(protect, checkPermission("create_events"), createEvent);

router
  .route("/:id")
  .get(protect, checkPermission("view_events"), getEventById)
  .put(protect, checkPermission("edit_events"), updateEvent)
  .delete(protect, checkPermission("delete_events"), deleteEvent);

module.exports = router;
