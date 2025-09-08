const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const User = require("../model/User/UserSchema")
const Jobs = require("../model/User/jobSchema");
const { jwtMiddleWare, generateToken } = require("../middleware/jwtAuthMiddleware");
const upload = require("../middleware/imageUploadMiddle")


// Save a job by jobseeker
router.post("/savejob/:jobId", jwtMiddleWare, async (req, res) => {
    try {
        const userId = req.jwtPayload.id; // ✅ Correct field
        const jobId = req.params.jobId;

        // Check if job exists
        const job = await Jobs.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Update user's savedJobs array
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent duplicate save
        if (user.savedJobs.includes(jobId)) {
            return res.status(400).json({ message: "Job already saved" });
        }

        user.savedJobs.push(jobId);
        await user.save();

        return res.status(200).json({
            message: "Job saved successfully",
            savedJobs: user.savedJobs
        });
    } catch (error) {
        console.error("Error saving job:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get("/getalllivejobs", async (req, res) => {

    try {
        const liveJobs = await Jobs.find({ status: "live" });
        if (!liveJobs || liveJobs.length === 0) {
            return res.status(404).json({ message: "No live jobs found" });
        }
        return res.status(200).json({ message: "Live jobs fetched successfully", liveJobs: liveJobs });

    } catch (e) {
        console.error("Error fetching saved jobs:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
);




// get save job by jobseeker
router.get("/getsavedJobs", jwtMiddleWare, async (req, res) => {
    try {
        const userId = req.jwtPayload.id; // ✅ Correct from JWT

        // Find the user and populate saved jobs
        const user = await User.findById(userId).populate("savedJobs");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // If no saved jobs
        if (!user.savedJobs || user.savedJobs.length === 0) {
            return res.status(404).json({ message: "No saved jobs found" });
        }

        return res.status(200).json({
            message: "Saved jobs fetched successfully",
            savedJobs: user.savedJobs
        });
    } catch (error) {
        console.error("Error fetching saved jobs:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



router.post("/applyforjob/:jobId", jwtMiddleWare, async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const userId = req.jwtPayload.id;

        const job = await Jobs.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job Not Found!" });
        }

        // Check if already applied
        if (job.candidatesApplied.includes(userId)) {
            return res.status(400).json({ message: "Already applied to this job" });
        }
        // Apply
        job.candidatesApplied.push(userId);
        await job.save();

        return res.status(200).json({ message: "Applied Successfully!" });
    } catch (e) {
        console.log("Error:", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



router.get("/getjobseekerprofile", jwtMiddleWare, async (req, res) => {
    try {
        const userId = req.jwtPayload.id;
        const user = await User.findById(userId).select("-password -recruterPhone -recruterCompany -recruterCompanyType -recruterCompanyAddress -recruterLogo -recruterIndustry");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "User profile fetched successfully", user });

    } catch (e) {
        console.log("error", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

router.put("/updateProfile", jwtMiddleWare, upload.fields([
    { name: "profilphoto", maxCount: 1 }, // ek photo
    { name: "resume", maxCount: 1 } // multiple documents allow
]), async (req, res) => {
    try {
        const userId = req.jwtPayload.id;
        const updateddata = req.body

        //console.log("Request Data:", updateddata);

        if (req.files["profilphoto"] && req.files["profilphoto"][0]) {
            updateddata.profilphoto = `/uploads/${req.files["profilphoto"][0].filename}`;
        }

        if (req.files["resume"] && req.files["resume"][0]) {
            updateddata.resume = `/uploads/${req.files["resume"][0].filename}`;
        }

        if (!userId) return res.status(400).json({ error: "Invalid Token Data" });
        //console.log("Extracted User ID:", userId);


        const response = await User.findByIdAndUpdate(userId, updateddata, {
            new: true,
            runValidators: true,
        });

        if (!response) {
            return res.status(404).json({ error: "User Not Found!" });
        }

        return res.status(200).json({ message: "Profile Updated Successfully", res: response });

    } catch (e) {
        console.log("error", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})



module.exports = router;