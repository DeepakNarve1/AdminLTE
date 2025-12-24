const mongoose = require("mongoose");
const State = require("./src/models/stateModel");
const Division = require("./src/models/divisionModel");
const District = require("./src/models/districtModel");
require("dotenv").config();

const states = [
  { name: "Madhya Pradesh" },
  { name: "Uttar Pradesh" },
  { name: "Maharashtra" },
  { name: "Gujarat" },
  { name: "Rajasthan" },
  { name: "Karnataka" },
  { name: "Tamil Nadu" },
];

const divisions = [
  { name: "Bhopal" },
  { name: "Indore" },
  { name: "Gwalior" },
  { name: "Jabalpur" },
  { name: "Ujjain" },
  { name: "Sagar" },
  { name: "Chambal" },
  { name: "Narmadapuram" },
  { name: "Shahdol" },
  { name: "Rewa" },
];

const districts = [
  // Bhopal Division
  { name: "Bhopal" },
  { name: "Raisen" },
  { name: "Rajgarh" },
  { name: "Sehore" },
  { name: "Vidisha" },
  // Indore Division
  { name: "Indore" },
  { name: "Dhar" },
  { name: "Jhabua" },
  { name: "Khargone" }, // West Nimar
  { name: "Khandwa" }, // East Nimar
  // Gwalior Division
  { name: "Gwalior" },
  { name: "Shivpuri" },
  { name: "Guna" },
  { name: "Ashoknagar" },
  { name: "Datia" },
  // Jabalpur Division
  { name: "Jabalpur" },
  { name: "Katni" },
  { name: "Narsinghpur" },
  { name: "Seoni" },
  { name: "Chhindwara" },
  // Ujjain Division
  { name: "Ujjain" },
  { name: "Dewas" },
  { name: "Ratlam" },
  { name: "Shajapur" },
  { name: "Agar Malwa" },
  // Sagar Division
  { name: "Sagar" },
  { name: "Damoh" },
  { name: "Panna" },
  { name: "Chhatarpur" },
  { name: "Tikamgarh" },
  // Chambal Division
  { name: "Morena" },
  { name: "Sheopur" },
  { name: "Bhind" },
  // Narmadapuram Division
  { name: "Narmadapuram" }, // Hoshangabad
  { name: "Betul" },
  { name: "Harda" },
  // Shahdol Division
  { name: "Shahdol" },
  { name: "Umaria" },
  { name: "Anuppur" },
  // Rewa Division
  { name: "Rewa" },
  { name: "Satna" },
  { name: "Sidhi" },
  { name: "Singrauli" },
];

async function seedData() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not defined in .env file");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await State.deleteMany({});
    console.log("🗑️  Cleared existing states");

    await Division.deleteMany({});
    console.log("🗑️  Cleared existing divisions");

    await District.deleteMany({});
    console.log("🗑️  Cleared existing districts");

    // Insert new data
    const createdStates = await State.insertMany(states);
    console.log(`✅ Created ${createdStates.length} states`);

    const createdDivisions = await Division.insertMany(divisions);
    console.log(`✅ Created ${createdDivisions.length} divisions`);

    const createdDistricts = await District.insertMany(districts);
    console.log(`✅ Created ${createdDistricts.length} districts`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedData();
