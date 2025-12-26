const mongoose = require("mongoose");
const Role = require("./src/models/roleModel");
const Permission = require("./src/models/permissionModel");
require("dotenv").config();

async function debugRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const roles = await Role.find().populate("permissions");

    roles.forEach((r) => {
      console.log(`Role: ${r.name}`);
      console.log(
        `Permissions: ${r.permissions.map((p) => p.name).join(", ")}`
      );
      console.log("---");
    });

    const perms = await Permission.find({
      name: { $in: ["create_states", "create_districts"] },
    });
    console.log("Check specific permissions existence:");
    console.log(perms);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

debugRoles();
