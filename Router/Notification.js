const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const User = require("../model/User/UserSchema")
const Jobs = require("../model/User/jobSchema");
const { jwtMiddleWare, generateToken } = require("../middleware/jwtAuthMiddleware");
const upload = require("../middleware/imageUploadMiddle")
const Notification = require("../model/Notifications/NotificationSchema");


router.post("/sentnotification", async (req, res) => {
    try {
        const type = req.body.type;
        let userId = req.body.userId;
        const extraData = req.body.extraData;

        if (!type) {
            return res.status(400).json({ msg: "Type and UserId are required" })
        }

        let title;
        let description;
        let targetScreen;
        const jobId = extraData ? extraData.jobId : null;
        const job = jobId ? await Jobs.findById({ _id: jobId }) : null;
        const jobTitle = job ? job.jobTitle : null;
        const jobSkillsArray = job && job.jobSkills ? job.jobSkills.split(",").map(s => s.trim()) : [];
        //        console.log("jobSkillsArray", jobSkillsArray);


        const skilledMatchUsers = await User.find({
            usertype: "jobseeker",
            $or: jobSkillsArray.map(skill => ({
                Skill: { $regex: skill, $options: "i" } // case-insensitive match
            }))
        });

        if (!userId) {
            const matchedUserIds = skilledMatchUsers.map(user => user._id);
            //console.log("matchedUserIds", matchedUserIds);
            userId = matchedUserIds;
        }



        switch (type) {
            case "NEW_JOB":
                title = "New Job Posted";
                description = "A new job has been posted that matches your profile. Check it out!";
                targetScreen = "JobDetails";
                break;
            case "VIEWED":
                title = "Application Viewed";
                description = "Your Application has been viewed by a recruiter.";
                targetScreen = "ApplicationStatus";
                break;
            case "SHORTLISTED":
                title = "You are Shortlisted";
                description = "Congratulations! You have been shortlisted for a job. Prepare for the next steps.";
                targetScreen = "ApplicationStatus";
                break;
            case "REJECTED":
                title = "Application Update";
                description = "We regret to inform you that you have not been selected for the position. Keep applying!";
                targetScreen = "ApplicationStatus";
                break;

            case "APPLIED":
                title = "Candidate Applied";
                description = `candidate has applied for ${jobTitle}. Review their application.`;
                targetScreen = "PostedJobs";
                break;
        }



        const notification = new Notification({
            userId: userId,
            title: title,
            description: description,
            type: type,
            targetScreen: targetScreen
        });

        const savedNotification = await notification.save();
        return res.status(201).json({ msg: "Notification created successfully", notification: savedNotification });
    } catch (e) {
        console.log("error", e);
        return res.status(500).json({ msg: "Internal Server Error" })
    }

});

router.get("/getnotifications", jwtMiddleWare, async (req, res) => {
    try {
        const userId = req.jwtPayload.id;
        const notifications = await Notification.find({ userId: userId }).sort({ createdAt: -1 });
        if (!notifications) {
            return res.status(404).json({ msg: "No notifications found" })
        }

        return res.status(200).json({ notifications: notifications });

    } catch (e) {
        console.log("error", e);

        return res.status(500).json({ msg: "Internal Server Error" })
    }

});

router.put("/readnotification/:id", async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




module.exports = router;