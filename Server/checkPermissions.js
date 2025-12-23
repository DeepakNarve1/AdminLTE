const mongoose = require("mongoose");
const Permission = require("./src/models/permissionModel");
require("dotenv").config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const perms = await Permission.find({});
  console.log("Total Perms:", perms.length);
  const mpPerms = perms.filter((p) => p.category === "mp_public_problems");
  console.log(
    "MP Perms:",
    mpPerms.map((p) => p.name)
  );

  const projectPerms = perms.filter((p) => p.category === "projects");
  console.log(
    "Project Perms:",
    projectPerms.map((p) => p.name)
  );

  const userPerms = perms.filter((p) => p.category === "users");
  console.log(
    "User Perms:",
    userPerms.map((p) => p.name)
  );

  process.exit();
}

check();
