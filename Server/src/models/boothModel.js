const mongoose = require("mongoose");

const boothSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Booth name is required"],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
    },
    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Block",
      required: true,
    },
  },
  { timestamps: true }
);

boothSchema.index({ code: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Booth", boothSchema);
