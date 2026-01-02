const mongoose = require("mongoose");
const Permission = require("./src/models/permissionModel");
require("dotenv").config();

async function checkPermissions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    const count = await Permission.countDocuments({});
    console.log(`Permission count is: ${count}`);
    const somePerms = await Permission.find({}).limit(5);
    console.log("Sample permissions:", somePerms);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkPermissions();
