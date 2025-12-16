// const mongoose = require("mongoose");
// require("dotenv").config();

// mongoose
//   .connect(process.env.MONGO_URL)
//   .then(() => console.log("Connected to MongoDB Server"))
//   .catch((err) => console.error("MongoDB Connection Error:", err));

// const db = mongoose.connection;

// db.on("disconnected", () => {
//   console.log("MongoDB Disconnected");
// });

// module.exports = db;


const mongoose = require("mongoose");
require("dotenv").config();

const mongoUrl = process.env.MONGO_URL;

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const db = mongoose.connection;

db.on("disconnected", () => {
  console.log("⚠️ MongoDB Disconnected");
});

module.exports = db;
