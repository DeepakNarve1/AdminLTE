const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    // Existing fields
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

    // SUGGESTED NEW FIELDS for enhanced functionality:

    // Event Duration (useful for Google Calendar)
    duration: {
      type: Number,
      default: 60, // Duration in minutes, default 1 hour
    },

    // Location Details (more specific than just district)
    venue: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },

    // Contact Information
    organizer: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
    },

    // Event Status
    status: {
      type: String,
      enum: ["Scheduled", "Confirmed", "Cancelled", "Completed", "Postponed"],
      default: "Scheduled",
    },

    // Expected Attendance
    expectedAttendees: {
      type: Number,
      default: 0,
    },

    // Priority Level
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },

    // Reminders (for notifications)
    reminders: {
      enabled: { type: Boolean, default: true },
      emailReminder: { type: Boolean, default: false },
      smsReminder: { type: Boolean, default: false },
    },

    // Notes/Remarks
    remarks: {
      type: String,
      default: "",
    },

    // Sync Status
    syncedToCalendar: {
      type: Boolean,
      default: false,
    },
    lastSyncedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);
