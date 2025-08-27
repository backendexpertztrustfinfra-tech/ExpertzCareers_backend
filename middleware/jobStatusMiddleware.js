const Jobs = require("../model/User/jobSchema");

const jobStatusMiddleware = async (req, res, next) => {
  try {
    const jobData = req.body;
    if (!jobData.status) {
      jobData.status = "pending"
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30)
    jobData.expiryDate = expiryDate

    const job = new Jobs(jobData)
    await job.save();

    setTimeout(async () => {
      await Jobs.findByIdAndUpdate(job._id, { status: "live" });
      console.log(`Job ${job._id} job is live `);
    }, 60000); // 20 seconds for testing, change to 86400000 for 24 hours

    req.job = job;
    next()
  } catch (error) {
    console.log("Job Status Middleware Error:", error);
    next();
  }
};

module.exports = { jobStatusMiddleware };
