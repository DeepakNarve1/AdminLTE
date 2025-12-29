const Event = require("../models/eventModel");
const {
  createGoogleEvent,
  updateGoogleEvent,
  deleteGoogleEvent,
} = require("../services/googleCalendarService");

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    const { month, search, startDate, endDate, page = 1, limit } = req.query;

    const query = {};

    if (month && month !== "All Months") {
      query.month = month;
    }

    if (startDate && endDate) {
      query.programDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (search) {
      query.$or = [
        { uniqueId: { $regex: search, $options: "i" } },
        { district: { $regex: search, $options: "i" } },
        { eventType: { $regex: search, $options: "i" } },
        { eventDetails: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page) || 1;
    // Parse limit: if not provided or invalid, default to 10
    // If explicitly -1, keep it as -1 for "all" entries
    let limitNum = 10;
    if (limit !== undefined && limit !== null && limit !== "") {
      const parsedLimit = parseInt(limit);
      if (!isNaN(parsedLimit)) {
        limitNum = parsedLimit;
      }
    }

    let events;
    let filteredCount;
    let totalCount;

    totalCount = await Event.countDocuments({});

    // If limit is -1, fetch all records
    if (limitNum === -1) {
      events = await Event.find(query).sort({ programDate: -1 });
      filteredCount = events.length;
    } else {
      const skip = (pageNum - 1) * limitNum;
      events = await Event.find(query)
        .sort({ programDate: -1 })
        .skip(skip)
        .limit(limitNum);
      filteredCount = await Event.countDocuments(query);
    }

    res.json({
      success: true,
      data: events,
      count: totalCount,
      filteredCount: filteredCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  try {
    // Create in Local DB
    const event = await Event.create(req.body);

    // Sync to Google Calendar
    try {
      const googleEventId = await createGoogleEvent(event);
      if (googleEventId) {
        event.googleEventId = googleEventId;
        await event.save();
      }
    } catch (syncError) {
      console.error("Failed to sync new event to Google Calendar:", syncError);
    }

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Unique ID already exists" });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Sync to Google Calendar
    try {
      if (updatedEvent.googleEventId) {
        await updateGoogleEvent(updatedEvent.googleEventId, updatedEvent);
      } else {
        // If it was never synced, sync it now
        const googleEventId = await createGoogleEvent(updatedEvent);
        if (googleEventId) {
          updatedEvent.googleEventId = googleEventId;
          await updatedEvent.save();
        }
      }
    } catch (syncError) {
      console.error("Failed to update Google Calendar event:", syncError);
    }

    res.json({ success: true, data: updatedEvent });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Unique ID already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    const googleEventId = event.googleEventId;
    await event.deleteOne();

    // Remove from Google Calendar
    if (googleEventId) {
      try {
        await deleteGoogleEvent(googleEventId);
      } catch (syncError) {
        console.error("Failed to delete Google Calendar event:", syncError);
      }
    }

    res.json({ success: true, message: "Event removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed events
// @route   GET /api/events/seed
const seedEvents = async (req, res) => {
  try {
    await Event.deleteMany({});
    const events = [];
    const districts = ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain"];
    const eventTypes = [
      "Social Events",
      "Religious Events",
      "Political Rally",
      "Meeting",
      "Inauguration",
    ];
    for (let i = 1; i <= 50; i++) {
      events.push({
        uniqueId: `ET/${i}`,
        district: districts[Math.floor(Math.random() * districts.length)],
        year: "2025",
        month: "February",
        receivingDate: new Date(),
        programDate: new Date(new Date().setDate(new Date().getDate() + i)),
        time: "19:00:00",
        eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        eventDetails: `Sample event details for event ${i}`,
      });
    }
    await Event.insertMany(events);
    res.json({ success: true, message: "Seeded events successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sync all unsynced events to Google Calendar
// @route   POST /api/events/sync
// @access  Private
const syncAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ googleEventId: { $exists: false } });
    let syncCount = 0;

    for (const event of events) {
      const googleEventId = await createGoogleEvent(event);
      if (googleEventId) {
        event.googleEventId = googleEventId;
        await event.save();
        syncCount++;
      }
    }

    res.json({
      success: true,
      message: `Successfully synced ${syncCount} events to Google Calendar.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  seedEvents,
  syncAllEvents,
};
