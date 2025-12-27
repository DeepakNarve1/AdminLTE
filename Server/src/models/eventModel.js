const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    uniqueId: { type: String, required: true, unique: true },
    district: { type: String, required: true },
    year: { type: String, required: true },
    month: { type: String, required: true },
    receivingDate: { type: Date, required: true },
    programDate: { type: Date, required: true },
    time: { type: String, required: true },
    eventType: { type: String, required: true },
    eventDetails: { type: String, required: true },
    googleEventId: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);
