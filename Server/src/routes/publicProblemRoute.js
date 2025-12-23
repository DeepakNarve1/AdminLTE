const express = require("express");
const {
  getPublicProblems,
  getPublicProblemById,
  createPublicProblem,
  updatePublicProblem,
  seedPublicProblems,
} = require("../controller/publicProblemController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, checkPermission("view_mp_public_problems"), getPublicProblems)
  .post(
    protect,
    checkPermission("create_mp_public_problems"),
    createPublicProblem
  );

router
  .route("/seed")
  .post(
    protect,
    checkPermission("create_mp_public_problems"),
    seedPublicProblems
  );

router
  .route("/:id")
  .get(
    protect,
    checkPermission("view_mp_public_problems"),
    getPublicProblemById
  )
  .put(
    protect,
    checkPermission("edit_mp_public_problems"),
    updatePublicProblem
  );

module.exports = router;
