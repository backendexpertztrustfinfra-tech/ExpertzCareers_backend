const express = require("express")
const router = express.Router();
const mongoose = require('mongoose')
const Jobs = require("../model/User/jobSchema");
const Users = require("../model/User/UserSchema")
const { jwtMiddleWare } = require("../middleware/jwtAuthMiddleware");


// create a job 
// router.post("/post",jwtMiddleWare,async (req,res)=>{
//     try{
//       const data = req.body 
//       data.jobCreatedby=req.jwtPayload.id
//       data.status = data.status || "pending";
//       if(data.status.toLowerCase() ==="closed"){
//          data.ClosedDate = new Date().toISOString();
//       }
//       const newJob = new Jobs(data)
//       const response = await newJob.save()
//       console.log("job added sucussfully");
//       return res.status(200).json({
//       message:"job added"
//       })   
//     }
//     catch(error){
//           console.log("error",error);
//     }
// })
// 
router.post("/post", jwtMiddleWare, async (req, res) => {
  try {
    const data = req.body;
    data.jobCreatedby = req.jwtPayload.id;
    data.status = data.status || "pending";

    if (data.status.toLowerCase() === "closed") {
      data.ClosedDate = new Date().toISOString();
    }

    const newJob = new Jobs(data);
    await newJob.save();

    // ✅ Get total job count after saving
    const totalJobs = await Jobs.countDocuments();

    console.log("job added successfully");
    return res.status(200).json({
      message: "job added",
      totalJobs: totalJobs, // 👈 send job count back
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
});


// get all jobs 
// rec id m kon s jobs created by rec id   

router.get("/getcreatedjobs", jwtMiddleWare,async (req,res)=>{
    try{

    const userId=req.jwtPayload.id
       const response = await Jobs.find({
        jobCreatedby:userId
       })

       if(!response){
        return res.status(404).json({msg:"Job Not Found!"})
       }
        return res.status(200).json({Jobs:response})
    }
    catch(error){
      console.log("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
       

    }
})

// applied job api which user applied on job 
// jobseeker when apply on job rec can see 

router.post("/apply/:jobId", jwtMiddleWare, async (req, res) => {
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

// get applied user data 
router.get("/getapplieduser/:jobId",async(req,res)=>{
  try{
       
    const jobId = req.params.jobId;
    const response =  await Jobs.findById(jobId).populate("candidatesApplied", "-password -recruterPhone -recruterCompany -recruterCompanyType -recruterCompanyAddress -recruterLogo -recruterIndustry")
    if(!response){
      return res.status(404).json({ message: "Job Not Found!" });
        }
  return res.status(200).json({candidatesApplied:response})
  }
  catch(e){
    console.log("error",e);
    return res.status(500).json({msg:"internal server error"})
    
  }
})

// saved candidate 
router.put("/savecandidate/:jobId/:candidateId", async (req, res) => {
  try {
    const { jobId, candidateId } = req.params;

    const job = await Jobs.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    // Avoid duplicate
    if (!job.savedCandidates.includes(candidateId)){
      job.savedCandidates.push(candidateId);
      await job.save();
    }
    return res.status(200).json({ 
      msg: "Candidate saved successfully", 
      savedCandidates: job.savedCandidates 
    });

  } catch (e) {
    console.log("error", e);
    return res.status(500).json({ msg: "Internal server error" });
  }
});


router.get("/getsaved/:jobId", async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await Jobs.findById(jobId)
      .populate("savedCandidates", "-password -phone -resume"); // sensitive fields hide

    if (!job) {
      return res.status(404).json({ message: "Job Not Found!" });
    }

    return res.status(200).json({
      success: true,
      count: job.savedCandidates.length,
      savedCandidates: job.savedCandidates
    });

  } catch (e) {
    console.log("error", e);
    return res.status(500).json({ msg: "Internal server error" });
  }
});



// related jobs for jobseeker

// router.get("/jobsbydesignation", jwtMiddleWare, async (req, res) => {
//   try {
//     const jobseekerId = req.jwtPayload.id;

//     // Step 1: Get the jobseeker's designation from DB
//     const user = await Users.findById(jobseekerId);
//     if (!user || !user.designation) {
//       return res.status(404).json({ msg: "Designation not found for user." });
//     }

//     const designation = user.designation;

//     // Step 2: Find jobs matching that designation
//     const jobs = await Jobs.find({
//       designation: { $regex: new RegExp(designation, "i") }, // case-insensitive
//     });

//     if (!jobs || jobs.length === 0) {
//       return res.status(404).json({ msg: "No jobs found for your designation." });
//     }

//     return res.status(200).json({ jobs });
//   } catch (error) {
//     console.log("Error fetching jobs by designation", error);
//     return res.status(500).json({ msg: "Internal Server Error" });
//   }
// });


// posted job updation 

router.put("/up/:id",jwtMiddleWare,async(req,res)=>{
  try{
    const jobId = req.params.id
    const jobUpdateData = req.body

    const response = await Jobs.findOneAndUpdate(
      {_id:jobId},
      jobUpdateData,
      {
       new:true,
       runValidators: true    
      } 
    )
 if(!response){
     return res.status(404).json({msg:"job Not Found!"})
 }
 console.log("job update sucess");
 return res.status(200).json({msg:"job update",UpdatedData:response})
    }
  catch(e){
   console.log("error",e);
   return res.status(500).json({msg:"Internal Server Error"})
  }
})

router.delete("/dlt/:id",jwtMiddleWare,async(req,res)=>{
  try{
    const jobId = req.params.id
   const response = await Jobs.findOneAndDelete(
    { _id:jobId}
  )
  if(!response){
    return res.status(404).json({msg:"job not found"})
  }
   console.log("dlt job sucessfully ");
   return res.status(200).json({msg:"job deleted",dltData:response})
  }
  catch(e){
   console.log("error",e);
   return res.status(500).json({msg:"Internal Server Error"})
  }
})


// live jobs 
router.get("/live", jwtMiddleWare, async (req, res) => {
  try {
    const userId = req.jwtPayload.id;

    // Count only active jobs created by this recruiter
    const liveJobCount = await Jobs.countDocuments({
      jobCreatedby: userId,
      status: "active"
    });

    return res.status(200).json({ liveJobs: liveJobCount });
  } catch (e) {
    console.log("error", e);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});






module.exports = router;














