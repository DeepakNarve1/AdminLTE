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
      enum: [
        "dashboard",
        "users",
        "roles",
        "projects",
        "mp_public_problems",
        "assembly_issue",
        "events",
        "voter",
        "samiti",
        "districts",
        "divisions",
        "states",
        "reports",
        "settings",
        "other",
      ],
      default: "other",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Permission", permissionSchema);
