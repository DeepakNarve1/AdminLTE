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
        "ganesh_samiti",
        "tenkar_samiti",
        "dp_samiti",
        "mandir_samiti",
        "bhagoria_samiti",
        "nirman_samiti",
        "booth_samiti",
        "block_samiti",
        "vidhansabha_samiti",
        "districts",
        "divisions",
        "states",
        "members",
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
