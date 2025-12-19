const express = require("express");
const {
  getPublicProblems,
  createPublicProblem,
  seedPublicProblems,
  getPublicProblemById,
  updatePublicProblem,
} = require("../controller/publicProblemController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getPublicProblems);
router.post("/", protect, createPublicProblem);
router.post("/seed", protect, seedPublicProblems); // Helper to populate DB
router.get("/:id", protect, getPublicProblemById);
router.put("/:id", protect, updatePublicProblem);

module.exports = router;
