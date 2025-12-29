const mongoose = require("mongoose");
const Event = require("./src/models/eventModel");
require("dotenv").config();

const sampleEvents = [];

// Data arrays for realistic event generation
const districts = [
  "Indore",
  "Bhopal",
  "Jabalpur",
  "Gwalior",
  "Ujjain",
  "Dewas",
  "Satna",
  "Sagar",
  "Ratlam",
  "Rewa",
  "Burhanpur",
  "Dhar",
  "Katni",
  "Raisen",
];

const eventTypes = [
  "Social Events",
  "Religious Events",
  "Political Rally",
  "Meeting",
  "Inauguration",
  "Other",
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const eventDetailsTemplates = {
  "Social Events": [
    "विवाह समारोह - Wedding ceremony with cultural programs",
    "उत्सव कार्यक्रम - Festival celebration with community participation",
    "सामाजिक मिलन समारोह - Social gathering and networking event",
    "सांस्कृतिक कार्यक्रम - Cultural program with traditional performances",
    "युवा सम्मेलन - Youth conference and skill development program",
  ],
  "Religious Events": [
    "धर्मसभा - Religious congregation and spiritual discourse",
    "कथा पाठ - Scripture reading and religious storytelling",
    "भजन संध्या - Devotional music evening",
    "पूजा अर्चना - Worship ceremony and prayers",
    "धार्मिक जुलूस - Religious procession and celebration",
  ],
  "Political Rally": [
    "जनसभा - Public rally and address by political leaders",
    "मतदाता जागरूकता कार्यक्रम - Voter awareness campaign",
    "विकास योजना प्रस्तुति - Development plan presentation",
    "जनता से संवाद - Public interaction and grievance redressal",
    "चुनाव प्रचार सभा - Election campaign rally",
  ],
  Meeting: [
    "समिति बैठक - Committee meeting for planning and coordination",
    "विकास समीक्षा बैठक - Development review meeting",
    "कार्यकर्ता बैठक - Workers meeting and strategy discussion",
    "पंचायत बैठक - Panchayat meeting for local governance",
    "विभागीय समन्वय बैठक - Departmental coordination meeting",
  ],
  Inauguration: [
    "नवीन भवन उद्घाटन - New building inauguration ceremony",
    "विकास परियोजना शुभारंभ - Development project launch",
    "सामुदायिक केंद्र उद्घाटन - Community center opening",
    "सड़क/पुल उद्घाटन - Road/Bridge inauguration",
    "स्वास्थ्य केंद्र उद्घाटन - Health center inauguration",
  ],
  Other: [
    "खेल प्रतियोगिता - Sports competition and games",
    "शैक्षिक कार्यक्रम - Educational program and workshop",
    "स्वास्थ्य शिविर - Health camp and medical checkup",
    "रक्तदान शिविर - Blood donation camp",
    "वृक्षारोपण कार्यक्रम - Tree plantation drive",
  ],
};

// Helper function to generate random date within a range
function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// Helper function to generate random time
function randomTime() {
  const hours = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
  const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:00`;
}

// Helper function to get month name from date
function getMonthName(date) {
  return months[date.getMonth()];
}

// Generate 1000 event entries
for (let i = 1; i <= 1000; i++) {
  const district = districts[Math.floor(Math.random() * districts.length)];
  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

  // Generate dates
  const startDate = new Date(2025, 0, 1); // Jan 1, 2025
  const endDate = new Date(2025, 11, 31); // Dec 31, 2025
  const programDate = randomDate(startDate, endDate);

  // Receiving date is usually 7-30 days before program date
  const daysBeforeProgram = Math.floor(Math.random() * 24) + 7;
  const receivingDate = new Date(programDate);
  receivingDate.setDate(receivingDate.getDate() - daysBeforeProgram);

  const year = programDate.getFullYear().toString();
  const month = getMonthName(programDate);

  // Get random event details based on event type
  const detailsArray = eventDetailsTemplates[eventType];
  const eventDetails =
    detailsArray[Math.floor(Math.random() * detailsArray.length)];

  // Generate time
  const time = randomTime();

  sampleEvents.push({
    uniqueId: `ET/${2025}/${String(i).padStart(4, "0")}`,
    district: district,
    year: year,
    month: month,
    receivingDate: receivingDate,
    programDate: programDate,
    time: time,
    eventType: eventType,
    eventDetails: eventDetails,
    // googleEventId will be populated when synced to Google Calendar
  });
}

async function seedEvents() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Event.deleteMany({});
    console.log("🗑️  Cleared existing events");

    // Insert new data
    const createdEvents = await Event.insertMany(sampleEvents);
    console.log(`✅ Created ${createdEvents.length} events`);

    console.log("\n📊 Event Statistics:");
    console.log("─────────────────────────────────────");

    // Count by event type
    const eventTypeCounts = {};
    createdEvents.forEach((event) => {
      eventTypeCounts[event.eventType] =
        (eventTypeCounts[event.eventType] || 0) + 1;
    });
    console.log("\n📋 Events by Type:");
    Object.entries(eventTypeCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    // Count by district
    const districtCounts = {};
    createdEvents.forEach((event) => {
      districtCounts[event.district] =
        (districtCounts[event.district] || 0) + 1;
    });
    console.log("\n🏙️  Events by District:");
    Object.entries(districtCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([district, count]) => {
        console.log(`   ${district}: ${count}`);
      });

    // Count by month
    const monthCounts = {};
    createdEvents.forEach((event) => {
      monthCounts[event.month] = (monthCounts[event.month] || 0) + 1;
    });
    console.log("\n📅 Events by Month:");
    Object.entries(monthCounts).forEach(([month, count]) => {
      console.log(`   ${month}: ${count}`);
    });

    console.log("\n─────────────────────────────────────");
    console.log(
      "\n💡 Tip: Use the 'Sync to Google Calendar' button in the UI to sync these events to Google Calendar"
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding events:", error);
    process.exit(1);
  }
}

seedEvents();
