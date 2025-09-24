const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
        type: String,
        enum: ["VIEWED", "SHORTLISTED", "REJECTED", "MESSAGE", "NEW_JOB"],
        required: true
    },
    targetScreen: { type: String, required: true },
    extraData: { type: Object },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;


