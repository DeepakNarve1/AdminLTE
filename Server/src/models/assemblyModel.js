const mongoose = require("mongoose");

const assemblySchema = new mongoose.Schema({
  name: { type: String, required: true },
  parliament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parliament",
    required: true,
  },
});

module.exports = mongoose.model("Assembly", assemblySchema);
