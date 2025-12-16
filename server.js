
require("dotenv").config()
const express = require("express")
const cors = require("cors")
const db = require("./config/db")
const upload = require("./config/multerConfig") 

const UserRoute = require("./Router/UserRoute")
const RecruiterRoute = require("./Router/Recruiter")
const JobseekerRoute = require("./Router/Jobseeker")
const JobRoutes = require("./Router/JobRouter")
const Notification = require("./Router/Notification")

const app = express()
app.use(cors({
  origin: "http://localhost:5174",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true })) // Add urlencoded parser for form data

// ---- All Routes Here ----
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/user", UserRoute)
app.use("/recruiter", RecruiterRoute)
app.use("/jobseeker", JobseekerRoute)
app.use("/job", JobRoutes)
app.use("/notification", Notification)

// ---- Base Route ----
app.get("/", (req, res) => {
  res.send("Server Running...")
})

// ---- Start Server ----
app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`)
})
