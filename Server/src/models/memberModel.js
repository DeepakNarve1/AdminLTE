const mongoose = require("mongoose");

const memberSchema = mongoose.Schema(
  {
    block: { type: String, required: true },
    year: { type: String, required: true },
    vehicle: { type: String, required: true },
    samiti: { type: String, required: true },
    code: { type: String, required: true },

    instagram: { type: String, default: "" },
    twitter: { type: String, default: "" },
    startLat: { type: Number, default: 0 },
    startLong: { type: Number, default: 0 },
    startDate: { type: Date },
    endLat: { type: Number, default: 0 },
    endLong: { type: Number, default: 0 },
    endDate: { type: Date },
    image: { type: String, default: "" }, // URL to image
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Member", memberSchema);
