const mongoose = require("mongoose");

const assemblyIssueSchema = mongoose.Schema(
  {
    uniqueId: { type: String, required: true },
    year: { type: String, required: true },
    acMpNo: { type: String, default: "N/A" },
    block: { type: String, required: true },
    sector: { type: String, required: true },
    microSectorNo: { type: String, required: true },
    microSectorName: { type: String, required: true },
    boothName: { type: String, required: true },
    boothNo: { type: String, required: true },
    gramPanchayat: { type: String, required: true },
    village: { type: String, required: true },
    faliya: { type: String, required: true },
    totalMembers: { type: Number, default: 0 },
    file: { type: String }, // For file path or URL
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AssemblyIssue", assemblyIssueSchema);
