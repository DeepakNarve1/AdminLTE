const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "District name is required"],
      unique: true,
      trim: true,
    },
    division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Division",
      required: [true, "Division is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("District", districtSchema);
