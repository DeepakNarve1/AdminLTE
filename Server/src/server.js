const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoute");
const rbacRoutes = require("./routes/rbacRoute");

dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Api is running...");
});

app.use("/api/auth", authRoutes);

// Mount rbac routes - this will handle /api/rbac/roles, /api/rbac/permissions
app.use("/api/rbac", rbacRoutes);

// Legacy support: map /api/roles/* to /api/rbac/roles/*
app.use("/api/roles", (req, res, next) => {
  req.url = "/roles" + req.url;
  rbacRoutes(req, res, next);
});

const publicProblemRoutes = require("./routes/publicProblemRoute");
app.use("/api/public-problems", publicProblemRoutes);

const projectRoutes = require("./routes/projectRoute");
app.use("/api/projects", projectRoutes);

const districtRoutes = require("./routes/districtRoute");
app.use("/api/districts", districtRoutes);

const divisionRoutes = require("./routes/divisionRoute");
app.use("/api/divisions", divisionRoutes);

const stateRoutes = require("./routes/stateRoute");
app.use("/api/states", stateRoutes);

const assemblyIssueRoutes = require("./routes/assemblyIssueRoute");
app.use("/api/assembly-issues", assemblyIssueRoutes);

const eventRoutes = require("./routes/eventRoute");
app.use("/api/events", eventRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
