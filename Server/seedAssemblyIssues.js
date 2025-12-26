const mongoose = require("mongoose");
const AssemblyIssue = require("./src/models/assemblyIssueModel");
require("dotenv").config();

const sampleIssues = [
  {
    uniqueId: "GS/177",
    year: "2024",
    acMpNo: "N/A",
    block: "Gandhwani",
    sector: "GANDHWANI",
    microSectorNo: "GGR 10",
    microSectorName: "KHOJAKUNWA",
    boothName: "रेहड़दा",
    boothNo: "229",
    gramPanchayat: "रेहड़दा",
    village: "कुंडी",
    faliya: "डावरपुरा",
    totalMembers: 9,
    file: "",
  },
  {
    uniqueId: "GS/176",
    year: "2025",
    acMpNo: "N/A",
    block: "Gandhwani",
    sector: "GANDHWANI",
    microSectorNo: "GGR 10",
    microSectorName: "KHOJAKUNWA",
    boothName: "रेहड़दा",
    boothNo: "229",
    gramPanchayat: "रेहड़दा",
    village: "कुंडी",
    faliya: "खाड़ापुरा",
    totalMembers: 9,
    file: "",
  },
  {
    uniqueId: "GS/175",
    year: "2025",
    acMpNo: "N/A",
    block: "Gandhwani",
    sector: "GANDHWANI",
    microSectorNo: "GGR 16",
    microSectorName: "CHIKLI",
    boothName: "चिकली",
    boothNo: "142",
    gramPanchayat: "चिकली",
    village: "चिकली",
    faliya: "हनुमानपुरा",
    totalMembers: 15,
    file: "",
  },
  {
    uniqueId: "GS/174",
    year: "2025",
    acMpNo: "N/A",
    block: "Gandhwani",
    sector: "BILDA",
    microSectorNo: "GBI 4",
    microSectorName: "KHEDALI HANUMAN",
    boothName: "कोदी",
    boothNo: "40",
    gramPanchayat: "पिथनपुर",
    village: "कोदी",
    faliya: "बयडीपुरा",
    totalMembers: 13,
    file: "",
  },
  {
    uniqueId: "GS/173",
    year: "2025",
    acMpNo: "N/A",
    block: "Gandhwani",
    sector: "GANDHWANI",
    microSectorNo: "GGR 3",
    microSectorName: "SOYLA",
    boothName: "सोयला (साली)",
    boothNo: "268",
    gramPanchayat: "सोयला",
    village: "सोयला",
    faliya: "मोर्यापुरा",
    totalMembers: 10,
    file: "",
  },
  {
    uniqueId: "GS/172",
    year: "2025",
    acMpNo: "N/A",
    block: "Tirla",
    sector: "Anjanai",
    microSectorNo: "TA 1",
    microSectorName: "Semlipura",
    boothName: "बोरी",
    boothNo: "105",
    gramPanchayat: "बोरी",
    village: "जोडवा",
    faliya: "जोडवा",
    totalMembers: 0,
    file: "",
  },
  {
    uniqueId: "GS/171",
    year: "2025",
    acMpNo: "N/A",
    block: "Gandhwani",
    sector: "PIPLI",
    microSectorNo: "GP 1",
    microSectorName: "PIPLI",
    boothName: "पिपली 246",
    boothNo: "246",
    gramPanchayat: "पिपली",
    village: "पिपली",
    faliya: "पिपली",
    totalMembers: 18,
    file: "",
  },
];

async function seedAssemblyIssues() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await AssemblyIssue.deleteMany({});
    console.log("🗑️  Cleared existing assembly issues");

    // Insert new data
    const createdIssues = await AssemblyIssue.insertMany(sampleIssues);
    console.log(`✅ Created ${createdIssues.length} assembly issues`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding assembly issues:", error);
    process.exit(1);
  }
}

seedAssemblyIssues();
