const mongoose = require("mongoose");

const subscriptionSchema = mongoose.Schema({
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: true },
    jobsPosted: { type: Number, default: 0 },
    jobPostLimit: { type: Number, required: true },
    dbPoints: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
});

const Subscriptions = mongoose.model("Subscription", subscriptionSchema);
module.exports = Subscriptions;

