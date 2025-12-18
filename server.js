require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db"); 
const UserRoute = require("./Router/UserRoute");
const RecruiterRoute = require("./Router/Recruiter");
const JobseekerRoute = require("./Router/Jobseeker");
const JobRoutes = require("./Router/JobRouter");
const Notification = require("./Router/Notification");

const app = express();
app.use(cors({
  origin: [
    "https://expertz-careers-frontend.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/user", UserRoute);
app.use("/recruiter", RecruiterRoute);
app.use("/jobseeker", JobseekerRoute);
app.use("/job", JobRoutes);
app.use("/notification", Notification);

// Base route
app.get("/", (req, res) => {
  res.send("Server Running...");
});

db.once("open", () => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
