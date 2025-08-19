// import mongoose from "mongoose";
// import dotenv from "dotenv";
// dotenv.config()
// const ConnectDB = async ()=>{
//     try{
//         await mongoose.connect(process.env.database)
//         console.log("database connected");     
//     }
//     catch(error){
//       console.log("database connection failed");
//       process.exit(1)
//     }
// }
// export default ConnectDB;


const mongoose = require("mongoose");
const mongodbUrl = "mongodb+srv://ExpertzCareers:Aakash1122@cluster0.klxjm43.mongodb.net/ExpertzCareerDB?retryWrites=true&w=majority&appName=Cluster0";


mongoose
  .connect(mongodbUrl)
  .then(() => console.log("Connected to MongoDB Server"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const db = mongoose.connection;
db.on("disconnected", () => {
  console.log("MongoDB Disconnected");
});

module.exports = db;