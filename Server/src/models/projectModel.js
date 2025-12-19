const mongoose = require("mongoose");

const projectSchema = mongoose.Schema(
  {
    district: { type: String, required: true },
    block: { type: String, required: true },
    department: { type: String, required: true },
    workName: { type: String, required: true },
    projectCost: { type: Number, required: true, default: 0 },
    proposalEstimate: { type: Number, required: true, default: 0 },
    tsNoDate: { type: String, default: "" },
    asNoDate: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    officerName: { type: String, default: "" },
    contactNumber: { type: String, default: "" },
    remarks: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
