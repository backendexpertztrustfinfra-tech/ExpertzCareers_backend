const mongoose = require("mongoose");

const plansSchema = mongoose.Schema({
    planName: { type: String, required: true },
    price: { type: Number, required: true },
    durationInDays: { type: Number, required: true },
    jobPostLimit: { type: Number, required: true },
    dbPoints: { type: Number, required: true },
});


const Plans = mongoose.model("Plan", plansSchema);
module.exports = Plans;

