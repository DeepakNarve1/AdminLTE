const mongoose = require("mongoose");
const userModel = require("./models/userModel");

async function run() {
  try {
    const MONGO_URI =
      "mongodb+srv://deepaknarve4_db_user:5SQ4VALv4L0i1rOe@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

    await mongoose.connect(MONGO_URI);

    // // Clear existing users
    // await userModel.deleteMany({});

    const users = [];
    for (let i = 1; i <= 100; i++) {
      users.push({
        name: `Manager${i}`,
        email: `manager${i}@example.com`,
        password:
          "$2b$10$hRY0rvd74eHzogpNJb5PaObzcYCwebZhqtmU4s/1EzkVsMBUqKLsS",
        role: "manager",
        mobile: `9876543${(1000 + i).toString().slice(-4)}`,
        userType: "regularUser",
        block: ["A", "B", "C", "D"][i % 4],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await userModel.insertMany(users);
    console.log("100 dummy users added!");
    process.exit();
  } catch (err) {
    console.error("Error inserting data:", err);
    process.exit(1);
  }
}

run();
