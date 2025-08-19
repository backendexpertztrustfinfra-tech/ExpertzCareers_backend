const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./config/db");
const bodyParser = require("body-parser");
require("dotenv").config();
app.use(bodyParser.json());
const corsOptions = {
  origin: ["https://95e00253a924.ngrok-free.app","http://localhost:5173"], 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true,            
};
app.use(cors(corsOptions));
const userRoutes = require("./Router/UserRoute");
const JobRoutes = require("./Router/JobRouter");
app.use("/user", userRoutes);
app.use("/job", JobRoutes); 
app.listen(3000, () => {
  console.log(`Server is Running http://localhost:3000`);
});



