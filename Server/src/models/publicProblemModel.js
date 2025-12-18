const mongoose = require("mongoose");

const publicProblemSchema = mongoose.Schema(
  {
    regNo: {
      type: String,
      required: true,
      unique: true,
    },
    // We will derive 'id' (Sr.No) from index or specific field if needed, but Mongo has _id.
    // We can store a visible ID if we want, or just use _id.
    // For "Timer", we assume it shows elapsed time since creation.

    submissionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // We can store explicit year/month/date strings for easier filtering
    // or derive them. The UI has separate columns for them.
    year: { type: String, required: true },
    month: { type: String, required: true },
    dateString: { type: String, required: true }, // "YYYY-MM-DD"

    district: { type: String, required: true },
    assembly: { type: String, default: "N/A" },
    block: { type: String, default: "N/A" },
    recommendedLetterNo: { type: String, default: "N/A" },
    boothNo: { type: String, default: "" },
    department: { type: String, default: "" },
    status: { type: String, default: "Pending" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PublicProblem", publicProblemSchema);
