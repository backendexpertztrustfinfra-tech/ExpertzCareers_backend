const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const User = require("../model/User/UserSchema")
const Jobs = require("../model/User/jobSchema");
const { jwtMiddleWare, generateToken } = require("../middleware/jwtAuthMiddleware");
const { jobStatusMiddleware } = require("../middleware/jobStatusMiddleware");

// create a job 


router.post("/postjob", jwtMiddleWare, jobStatusMiddleware, (req, res) => {
    res.json({ success: true, job: req.job });
});


router.put("/savecandidate/:userId", jwtMiddleWare, async (req, res) => {
    try {
        const saveuserId = req.params.userId;
        const userId = req.jwtPayload.id;

        const newsaveuser = await User.findById(saveuserId);
        const user = await User.findById(userId);

        if (!user || !newsaveuser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.savedCandidates.includes(saveuserId)) {
            return res.status(400).json({ message: "Already saved to this " });
        }

        user.savedCandidates.push(saveuserId);
        const result = await user.save();
        return res.status(200).json({ message: "Candidate saved successfully!", user: result });
    } catch (error) {
        console.error("Error saving applied candidate:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get("/getapplieduser/:jobId", jwtMiddleWare, async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const userId = req.jwtPayload.id;
        const response = await Jobs.findOne({ _id: jobId, jobCreatedby: userId }).populate("candidatesApplied", "-password -recruterPhone -recruterCompany -recruterCompanyType -recruterCompanyAddress -recruterLogo -recruterIndustry")
        if (!response) {
            return res.status(404).json({ message: "No candidated found!" });
        }

        return res.status(200).json({ candidatesApplied: response.candidatesApplied })
    }
    catch (e) {
        console.log("error", e);
        return res.status(500).json({ msg: "internal server error" })

    }
})




router.get("/getsavedcandidates", jwtMiddleWare, async (req, res) => {
    try {

        const userId = req.jwtPayload.id; // ✅ Correct from JWT

        // Find the user and populate saved jobs
        const user = await User.findById(userId).populate("savedCandidates");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // If no saved jobs
        if (!user.savedCandidates || user.savedCandidates.length === 0) {
            return res.status(404).json({ message: "No saved candidates found" });
        }

        return res.status(200).json({
            message: "Saved candidates fetched successfully",
            savedCandidates: user.savedCandidates
        });

    }
    catch (error) {
        console.error("Error saving applied candidate:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

router.get("/getcreatedjobs", jwtMiddleWare, async (req, res) => {
    try {

        const userId = req.jwtPayload.id;

        const jobs = await Jobs.find({ jobCreatedby: userId });
        if (!jobs) {
            return res.status(404).json({ message: "No jobs found" });
        }

        return res.status(200).json({
            message: "Jobs fetched successfully",
            jobs: jobs
        });

    } catch (error) {
        console.error("Error saving applied candidate:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get("/getlivejobs", jwtMiddleWare, async (req, res) => {
    try {

        const userId = req.jwtPayload.id;

        const jobs = await Jobs.find({ jobCreatedby: userId, status: "live" });
        if (!jobs) {
            return res.status(404).json({ message: "No live jobs found" });
        }

        return res.status(200).json({
            message: "Live Jobs fetched successfully",
            jobs: jobs
        });

    } catch (error) {
        console.error("Error Live Job:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get("/getpendingjobs", jwtMiddleWare, async (req, res) => {
    try {

        const userId = req.jwtPayload.id;

        const jobs = await Jobs.find({ jobCreatedby: userId, status: "pending" });
        if (!jobs) {
            return res.status(404).json({ message: "No pending jobs found" });
        }

        return res.status(200).json({
            message: "Pending Jobs fetched successfully",
            jobs: jobs
        });

    } catch (error) {
        console.error("Error Pending:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});






router.delete("/deletejob/:id", jwtMiddleWare, async (req, res) => {
    try {
        const jobId = req.params.id
        const response = await Jobs.findOneAndDelete(
            {
                _id: jobId,
                jobCreatedby: req.jwtPayload.id
            }
        )
        if (!response) {
            return res.status(404).json({ msg: "someting went wrong" })
        }
        console.log("Job Deleted Sucessfully ");
        return res.status(200).json({ msg: "job deleted", dltData: response })
    }
    catch (e) {
        console.log("error", e);
        return res.status(500).json({ msg: "Internal Server Error" })
    }
})


router.put("/updatejob/:id", jwtMiddleWare, async (req, res) => {
    try {
        const jobId = req.params.id
        const jobUpdatedData = req.body

        const response = await Jobs.findOneAndUpdate(
            {
                _id: jobId,
                jobCreatedby: req.jwtPayload.id
            },
            jobUpdatedData,
            {
                new: true,
                runValidators: true
            }
        )
        if (!response) {
            return res.status(404).json({ msg: "Job Not Found!" })
        }
        console.log("Job Update Succssfully");
        return res.status(200).json({ msg: "Job Update Succssfully", UpdatedData: response })



    } catch (e) {
        console.log("error", e);
        return res.status(500).json({ msg: "Internal Server Error" })

    }
});




router.get("/getclosedjobs", jwtMiddleWare, async (req, res) => {
    try {

        const userId = req.jwtPayload.id;

        const jobs = await Jobs.find({ jobCreatedby: userId, status: "closed" });
        if (!jobs) {
            return res.status(404).json({ message: "No closed jobs found" });
        }

        return res.status(200).json({
            message: "Closed Jobs fetched successfully",
            jobs: jobs
        });

    } catch (error) {
        console.error("Error closed Job:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get("/getRecruiterProfile", jwtMiddleWare, async (req, res) => {
    try {
        const userId = req.jwtPayload.id;
        const response = await User.findOne({ _id: userId })
        if (!response) {
            console.log("User Not Found!")
            return res.status(404).json({ msg: "User Not Found!" })
        }
        return res.status(200).json({ user: response });
    } catch (e) {
        console.log("error", e);
        return res.status(500).json({ msg: "Internal Server Error" })
    }
});


router.put("/updateRecruiterProfile", jwtMiddleWare, async (req, res) => {
    try {
        const userId = req.jwtPayload.id
        const userUpdatedData = req.body

        const response = await User.findOneAndUpdate(
            { _id: userId },
            userUpdatedData,
            {
                new: true,
                runValidators: true
            }
        )
        if (!response) {
            return res.status(404).json({ msg: "User Not Found!" })
        }
        console.log("User Update Succssfully");
        return res.status(200).json({ msg: "User Update Succssfully", UpdatedData: response })
    }
    catch (e) {
        console.log("error", e);
        return res.status(500).json({ msg: "Internal Server Error" })

    }
});



module.exports = router;