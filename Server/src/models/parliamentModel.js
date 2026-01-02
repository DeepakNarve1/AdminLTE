const mongoose = require("mongoose");

const parliamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Division",
    required: true,
  },
});

module.exports = mongoose.model("Parliament", parliamentSchema);
