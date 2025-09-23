const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./config/db");
const bodyParser = require("body-parser");
require("./cronJobs");
const path = require('path');
require("dotenv").config();
app.use(bodyParser.json());

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




app.use(cors(corsOptions));
const userRoutes = require("./Router/UserRoute");
const JobRoutes = require("./Router/JobRouter");
const RecruiterRoutes = require("./Router/Recruiter")
const JobseekerRoutes = require("./Router/Jobseeker")
const Notification = require("./Router/Notification")

app.use("/recruiter", RecruiterRoutes)
app.use("/jobseeker", JobseekerRoutes)
app.use("/user", userRoutes);
app.use("/job", JobRoutes);
app.use("/notification", Notification);
app.listen(3000, () => {
  console.log(`Server is Running http://localhost:3000`);
});



