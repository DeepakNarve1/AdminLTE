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
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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

const parliamentRoutes = require("./routes/parliamentRoute");
app.use("/api/parliaments", parliamentRoutes);

const assemblyRoutes = require("./routes/assemblyRoute");
app.use("/api/assemblies", assemblyRoutes);

const blockRoutes = require("./routes/blockRoute");
app.use("/api/blocks", blockRoutes);

const boothRoutes = require("./routes/boothRoute");
app.use("/api/booths", boothRoutes);

const assemblyIssueRoutes = require("./routes/assemblyIssueRoute");
app.use("/api/assembly-issues", assemblyIssueRoutes);

const eventRoutes = require("./routes/eventRoute");
app.use("/api/events", eventRoutes);

const memberRoutes = require("./routes/memberRoute");
app.use("/api/members", memberRoutes);

const samitiRoutes = require("./routes/samitiRoute");
const SAMITI_TYPES = [
  "ganesh-samiti",
  "tenkar-samiti",
  "dp-samiti",
  "mandir-samiti",
  "bhagoria-samiti",
  "nirman-samiti",
  "booth-samiti",
  "block-samiti",
];

SAMITI_TYPES.forEach((type) => {
  app.use(`/api/${type}`, (req, res, next) => {
    req.samitiType = type;
    samitiRoutes(req, res, next);
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
