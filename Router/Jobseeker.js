const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const User = require("../model/User/UserSchema")
const Jobs = require("../model/User/jobSchema");
const { jwtMiddleWare, generateToken } = require("../middleware/jwtAuthMiddleware");
const upload = require("../middleware/imageUploadMiddle")


router.post("/savejob/:jobId", jwtMiddleWare, async (req, res) => {
    try {
        const userId = req.jwtPayload.id; // ✅ Correct field
        const jobId = req.params.jobId;


        const job = await Jobs.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Update user's savedJobs array
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const alreadySaved = user.savedJobs.some(
            (item) => item.job.toString() === jobId
        );
        if (alreadySaved) {
            return res.status(400).json({ message: "Job already saved" });
        }

        user.savedJobs.push({
            job: jobId,
            savedAt: new Date()
        });
        await user.save();

        return res.status(200).json({
            message: "Job saved successfully",
        });
    } catch (error) {
        console.error("Error saving job:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get("/getalllivejobs", jwtMiddleWare, async (req, res) => {

    try {
        const userId = req.jwtPayload.id;

        const liveJobs = await Jobs.find({
            status: "live",
            "candidatesApplied.userId": { $ne: userId } // userId candidatesApplied mein nahi hai
        });
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

router.get("/appliedjobs", jwtMiddleWare, async (req, res) => {
    try {

        const userId = req.jwtPayload.id;

        const appliedJobs = await Jobs.find({
            "candidatesApplied.userId": userId

        }).select('-jobCreatedby -savedCandidates');
        if (!appliedJobs || appliedJobs.length === 0) {
            return res.status(404).json({ message: "No applied jobs found" });
        }

        const jobsWithStatus = appliedJobs.map(job => {
            // Safe find with checks
            const candidate = job.candidatesApplied.find(
                c => c && c.userId && c.userId.toString() === userId.toString()
            );

            return {
                ...job.toObject(),
                applicationStatus: candidate ? candidate.status : null,
                appliedAt: candidate ? candidate.appliedAt : null
            };
        });

        return res.status(200).json({ message: "Applied jobs fetched successfully", appliedJobs: jobsWithStatus });
    } catch (error) {
        console.error("Error fetching applied jobs:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});





// get save job by jobseeker
router.get("/getsavedJobs", jwtMiddleWare, async (req, res) => {
    try {
        const userId = req.jwtPayload.id; // ✅ Correct from JWT

        // Find the user and populate saved jobs
        const user = await User.findById(userId).populate({
            path: "savedJobs.job", // ✅ Nested path
            select: "-jobCreatedby -candidatesApplied -savedCandidates"
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        if (!user.savedJobs || user.savedJobs.length === 0) {
            return res.status(404).json({ message: "No saved jobs found" });
        }


        const formattedJobs = user.savedJobs.map((item) => ({
            job: item.job,
            savedAt: item.savedAt
        }));

        return res.status(200).json({
            message: "Saved jobs fetched successfully",
            savedJobs: formattedJobs
        });
    } catch (error) {
        console.error("Error fetching saved jobs:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.delete("/removesavedjob/:jobId", jwtMiddleWare, async (req, res) => {
    try {
        const userId = req.jwtPayload.id;
        const jobId = req.params.jobId;

        // ✅ Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ✅ Check if job exists
        const job = await Jobs.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // ✅ Check if job is actually saved
        const isSaved = user.savedJobs.some(
            (item) => item.job.toString() === jobId
        );
        if (!isSaved) {
            return res.status(400).json({ message: "Job is not saved" });
        }

        // ✅ Remove the saved job
        user.savedJobs = user.savedJobs.filter(
            (item) => item.job.toString() !== jobId
        );

        await user.save();

        return res.status(200).json({
            message: "Job removed from saved jobs successfully",
        });
    } catch (error) {
        console.error("Error removing saved job:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



router.post("/applyforjob/:jobId", jwtMiddleWare, async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const userId = req.jwtPayload?.id;
        console.log("UserId:", userId, "Jo  bId:", jobId);

        const job = await Jobs.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job Not Found!" });
        }


        const alreadyApplied = job.candidatesApplied.find(
            candidate => candidate.userId.equals(userId));

        if (alreadyApplied) {
            return res.status(400).json({ message: "Already applied to this job" });
        }

        job.candidatesApplied.push({
            userId: userId,
            status: "applied",
            appliedAt: new Date(),
        });

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
        const user = await User.findById(userId).select("-password -recruterPhone -recruterCompany -recruterCompanyType -recruterCompanyAddress -recruterLogo -recruterIndustry -recruterGstIn -recruterCompanyDoc -savedJobs -savedCandidates");
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
    { name: "resume", maxCount: 1 },// multiple documents allow
    { name: "introvideo", maxCount: 1 }
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

        if (req.files["introvideo"] && req.files["introvideo"][0]) {
            updateddata.introvideo = `/uploads/${req.files["introvideo"][0].filename}`;
        }

        if (!userId) return res.status(400).json({ error: "Invalid Token Data" });

        const response = await User.findByIdAndUpdate(userId, updateddata, {
            new: true,
            runValidators: true,
        });

        if (!response) {
            return res.status(404).json({ error: "User Not Found!" });
        }

        return res.status(200).json({ message: "Profile Updated Successfully" });

    } catch (e) {
        console.log("error", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})



module.exports = router;