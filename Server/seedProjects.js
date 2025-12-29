const mongoose = require("mongoose");
const Project = require("./src/models/projectModel");
require("dotenv").config();

const sampleProjects = [];

const districts = ["Dhar", "Indore", "Ujjain", "Dewas", "Khargone", "Barwani"];
const blocks = [
  "Gandhwani",
  "Tirla",
  "Bagh",
  "Kukshi",
  "Manawar",
  "Dhar",
  "Badnawar",
  "Dharampuri",
];
const departments = [
  "Public Works Department (PWD)",
  "Rural Development",
  "Water Resources",
  "Education",
  "Health & Family Welfare",
  "Agriculture",
  "Panchayat & Rural Development",
  "Urban Development",
];
const workTypes = [
  "Road Construction",
  "Bridge Construction",
  "School Building",
  "Hospital Building",
  "Water Supply Scheme",
  "Drainage System",
  "Community Hall",
  "Anganwadi Center",
  "Primary Health Center",
  "Canal Construction",
];
const locations = [
  "Kundi",
  "Chikli",
  "Kodi",
  "Soyla",
  "Bori",
  "Pipli",
  "Rehda",
  "Jeerabad",
  "Pithanpur",
  "Moryapura",
];
const statuses = ["Pending", "In Progress", "Completed"];
const officerNames = [
  "Rajesh Kumar",
  "Priya Sharma",
  "Amit Patel",
  "Sunita Verma",
  "Vikram Singh",
  "Anjali Gupta",
  "Rahul Jain",
  "Kavita Rao",
  "Suresh Mehta",
  "Pooja Desai",
];

// Helper function to generate random date string
function randomDate(start, end) {
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Helper function to generate phone number
function randomPhone() {
  return `${Math.floor(Math.random() * 9000000000) + 1000000000}`;
}

// Generate 1000 project entries
for (let i = 1; i <= 1000; i++) {
  const district = districts[Math.floor(Math.random() * districts.length)];
  const block = blocks[Math.floor(Math.random() * blocks.length)];
  const department =
    departments[Math.floor(Math.random() * departments.length)];
  const workType = workTypes[Math.floor(Math.random() * workTypes.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const officer = officerNames[Math.floor(Math.random() * officerNames.length)];

  const projectCost = Math.floor(Math.random() * 50000000) + 500000; // 5 lakh to 5 crore
  const proposalEstimate = Math.floor(
    projectCost * (0.8 + Math.random() * 0.4)
  ); // 80% to 120% of project cost

  const tsDate = randomDate(new Date(2023, 0, 1), new Date(2024, 11, 31));
  const asDate = randomDate(new Date(2024, 0, 1), new Date(2025, 11, 31));

  const remarks = [
    "Work in progress as per schedule",
    "Delayed due to monsoon",
    "Completed ahead of schedule",
    "Awaiting approval from higher authorities",
    "Budget revision required",
    "Quality inspection pending",
    "Land acquisition in process",
    "Environmental clearance obtained",
    "",
    "",
  ];

  sampleProjects.push({
    district: district,
    block: block,
    department: department,
    workName: `${workType} at ${location}, ${block}`,
    projectCost: projectCost,
    proposalEstimate: proposalEstimate,
    tsNoDate: `TS/${2023 + Math.floor(i / 500)}/${String(i).padStart(
      4,
      "0"
    )} - ${tsDate}`,
    asNoDate: `AS/${2024 + Math.floor(i / 500)}/${String(i).padStart(
      4,
      "0"
    )} - ${asDate}`,
    status: status,
    officerName: officer,
    contactNumber: randomPhone(),
    remarks: remarks[Math.floor(Math.random() * remarks.length)],
  });
}

async function seedProjects() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Project.deleteMany({});
    console.log("🗑️  Cleared existing projects");

    // Insert new data
    const createdProjects = await Project.insertMany(sampleProjects);
    console.log(`✅ Created ${createdProjects.length} projects`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding projects:", error);
    process.exit(1);
  }
}

seedProjects();
