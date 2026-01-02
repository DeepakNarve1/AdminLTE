const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema({
  name: { type: String, required: true },
  assembly: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assembly",
    required: true,
  },
});

module.exports = mongoose.model("Block", blockSchema);
