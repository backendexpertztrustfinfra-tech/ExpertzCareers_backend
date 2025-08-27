const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./config/db");
const bodyParser = require("body-parser");
require("./cronJobs");
require("dotenv").config();
app.use(bodyParser.json());

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};


app.use(cors(corsOptions));
const userRoutes = require("./Router/UserRoute");
const JobRoutes = require("./Router/JobRouter");
const RecruiterRoutes = require("./Router/Recruiter")
const JobseekerRoutes = require("./Router/Jobseeker")

app.use("/recruiter", RecruiterRoutes)
app.use("/jobseeker", JobseekerRoutes)
app.use("/user", userRoutes);
app.use("/job", JobRoutes);
app.listen(3000, () => {
  console.log(`Server is Running http://localhost:3000`);
});



