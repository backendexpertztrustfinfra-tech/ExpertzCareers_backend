const express = require("express")
const router = express.Router();
const mongoose = require('mongoose')
const Jobs = require("../model/User/jobSchema");
const { jwtMiddleWare } = require("../middleware/jwtAuthMiddleware");

router.get("/dashboard/stats", jwtMiddleWare, async (req, res) => {
  try {
    const userId = req.jwtPayload.id;
    const stats = await Jobs.aggregate([
      { $match: { jobCreatedby: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    let totalJobs = 0;
    let liveJobs = 0;
    let pendingJobs = 0;
    let closedJobs = 0;

    stats.forEach(stat => {
      totalJobs += stat.count;
      if (stat._id === "live") liveJobs = stat.count;
      if (stat._id === "pending") pendingJobs = stat.count;
      if (stat._id === "close") closedJobs = stat.count;
    });

    res.json({
      success: true,
      data: {
        totalJobs,
        liveJobs,
        pendingJobs,
        closedJobs
      }
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/designation/:title", async (req, res) => {
  try {
    const { title } = req.params;
    const jobs = await Jobs.find({
      jobTitle: { $regex: title, $options: "i" },
      status: "live"
    });
    if (!jobs.length) return res.status(404).json({ message: "No jobs found for this designation" });

    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/live", jwtMiddleWare, async (req, res) => {
  try {
    const userId = req.jwtPayload.id;

    // Count only active jobs created by this recruiter
    const liveJobCount = await Jobs.countDocuments({
      jobCreatedby: userId,
      status: "live"
    });

    return res.status(200).json({ liveJobs: liveJobCount });
  } catch (e) {
    console.log("error", e);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = router;













