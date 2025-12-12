const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["users", "reports", "settings", "dashboard", "other"],
      default: "other",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Permission", permissionSchema);
