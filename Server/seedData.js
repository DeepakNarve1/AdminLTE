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

const divisionsWithState = [
  { name: "Bhopal", state: "Madhya Pradesh" },
  { name: "Indore", state: "Madhya Pradesh" },
  { name: "Gwalior", state: "Madhya Pradesh" },
  { name: "Jabalpur", state: "Madhya Pradesh" },
  { name: "Ujjain", state: "Madhya Pradesh" },
  { name: "Sagar", state: "Madhya Pradesh" },
  { name: "Chambal", state: "Madhya Pradesh" },
  { name: "Narmadapuram", state: "Madhya Pradesh" },
  { name: "Shahdol", state: "Madhya Pradesh" },
  { name: "Rewa", state: "Madhya Pradesh" },
  { name: "Lucknow", state: "Uttar Pradesh" },
];

const districtsWithDivision = [
  // Bhopal Division
  { name: "Bhopal", division: "Bhopal" },
  { name: "Raisen", division: "Bhopal" },
  { name: "Rajgarh", division: "Bhopal" },
  { name: "Sehore", division: "Bhopal" },
  { name: "Vidisha", division: "Bhopal" },
  // Indore Division
  { name: "Indore", division: "Indore" },
  { name: "Dhar", division: "Indore" },
  { name: "Jhabua", division: "Indore" },
  { name: "Khargone", division: "Indore" }, // West Nimar
  { name: "Khandwa", division: "Indore" }, // East Nimar
  // Gwalior Division
  { name: "Gwalior", division: "Gwalior" },
  { name: "Shivpuri", division: "Gwalior" },
  { name: "Guna", division: "Gwalior" },
  { name: "Ashoknagar", division: "Gwalior" },
  { name: "Datia", division: "Gwalior" },
  // Jabalpur Division
  { name: "Jabalpur", division: "Jabalpur" },
  { name: "Katni", division: "Jabalpur" },
  { name: "Narsinghpur", division: "Jabalpur" },
  { name: "Seoni", division: "Jabalpur" },
  { name: "Chhindwara", division: "Jabalpur" },
  // Ujjain Division
  { name: "Ujjain", division: "Ujjain" },
  { name: "Dewas", division: "Ujjain" },
  { name: "Ratlam", division: "Ujjain" },
  { name: "Shajapur", division: "Ujjain" },
  { name: "Agar Malwa", division: "Ujjain" },
  // Sagar Division
  { name: "Sagar", division: "Sagar" },
  { name: "Damoh", division: "Sagar" },
  { name: "Panna", division: "Sagar" },
  { name: "Chhatarpur", division: "Sagar" },
  { name: "Tikamgarh", division: "Sagar" },
  // Chambal Division
  { name: "Morena", division: "Chambal" },
  { name: "Sheopur", division: "Chambal" },
  { name: "Bhind", division: "Chambal" },
  // Narmadapuram Division
  { name: "Narmadapuram", division: "Narmadapuram" }, // Hoshangabad
  { name: "Betul", division: "Narmadapuram" },
  { name: "Harda", division: "Narmadapuram" },
  // Shahdol Division
  { name: "Shahdol", division: "Shahdol" },
  { name: "Umaria", division: "Shahdol" },
  { name: "Anuppur", division: "Shahdol" },
  // Rewa Division
  { name: "Rewa", division: "Rewa" },
  { name: "Satna", division: "Rewa" },
  { name: "Sidhi", division: "Rewa" },
  { name: "Singrauli", division: "Rewa" },
  // Lucknow Division
  { name: "Lucknow", division: "Lucknow" },
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

    // Creates State Map
    const stateMap = {};
    createdStates.forEach((st) => {
      stateMap[st.name] = st._id;
    });

    const divisionsToInsert = divisionsWithState.map((d) => {
      const stateId = stateMap[d.state];
      if (!stateId) {
        console.warn(`⚠️ State not found for division: ${d.name} (${d.state})`);
      }
      return {
        name: d.name,
        state: stateId,
      };
    });

    const createdDivisions = await Division.insertMany(divisionsToInsert);
    console.log(`✅ Created ${createdDivisions.length} divisions`);

    // Create a map of division name to ID
    const divisionMap = {};
    createdDivisions.forEach((div) => {
      divisionMap[div.name] = div._id;
    });

    const districtsToInsert = districtsWithDivision.map((d) => {
      const divisionId = divisionMap[d.division];
      if (!divisionId) {
        console.warn(
          `⚠️ Division not found for district: ${d.name} (${d.division})`
        );
      }
      return {
        name: d.name,
        division: divisionId,
      };
    });

    const createdDistricts = await District.insertMany(districtsToInsert);
    console.log(`✅ Created ${createdDistricts.length} districts`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedData();
