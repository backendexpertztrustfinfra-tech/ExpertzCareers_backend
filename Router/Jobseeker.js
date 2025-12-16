const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const User = require("../model/User/UserSchema")
const Jobs = require("../model/User/jobSchema");
const { jwtMiddleWare, generateToken } = require("../middleware/jwtAuthMiddleware");
const upload = require("../config/multerConfig")


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

// router.get("/getalllivejobs", jwtMiddleWare, async (req, res) => {

//     try {
//         const userId = req.jwtPayload.id;
//         const user = await User.findById(userId).select('savedJobs');
//         const savedJobIds = user?.savedJobs?.map(saved => saved.job.toString()) || [];



//         const liveJobs = await Jobs.find({
//             status: "live",
//             "candidatesApplied.userId": { $ne: userId }, // Apply nahi ki
//             _id: { $nin: savedJobIds } // Saved jobs mein nahi hai
//         }).sort({ createdAt: -1 });

//         if (!liveJobs || liveJobs.length === 0) {
//             return res.status(404).json({ message: "No live jobs found" });
//         }

     

//     } catch (e) {
//         console.error("Error fetching saved jobs:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// }
// );

router.get("/getalllivejobs", jwtMiddleWare, async (req, res) => {
  try {
    const userId = req.jwtPayload.id;
    
    const user = await User.findById(userId).select("savedJobs");
    const savedJobIds = user?.savedJobs?.map((s) => s.job.toString()) || [];

    // Find all live jobs that user has NOT applied and NOT saved
    const liveJobs = await Jobs.find({
      status: "live",
      "candidatesApplied.userId": { $ne: userId },
      _id: { $nin: savedJobIds },
    }).sort({ createdAt: -1 });

    return res.status(200).json({ liveJobs });
  } catch (error) {
    console.error("Error fetching live jobs:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


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

router.get("/getsavedJobs", jwtMiddleWare, async (req, res) => {
    try {
        const userId = req.jwtPayload.id; 

        const user = await User.findById(userId).populate({
            path: "savedJobs.job", 
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
        const user = await User.findById(userId).select("-password -recruterPhone -recruterCompany -recruterCompanyType -recruterCompanyAddress -recruterLogo -recruterIndustry -recruterGstIn -recruterCompanyDoc -savedJobs -savedCandidates -otp -otpExpires -isVerified -createdAt -updatedAt -__v");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "User profile fetched successfully", user });

    } catch (e) {
        console.log("error", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})





module.exports = router;
