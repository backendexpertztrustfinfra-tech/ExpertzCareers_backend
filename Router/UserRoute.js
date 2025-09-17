const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const User = require("../model/User/UserSchema")
const Jobs = require("../model/User/jobSchema");
const Test = require("../model/User/TestSchema")
const { jwtMiddleWare, generateToken } = require("../middleware/jwtAuthMiddleware");
const Plans = require("../model/Plan/PlansSchema")
const Subscription = require("../model/Subscriptions/SubscriptionSchema")


router.post("/signup", async (req, res) => {
  try {
    const data = req.body;
    // console.log("UsernAME:",data.username)
    const newUser = new User(data);
    const response = await newUser.save();

    const jwtPayload = { id: response.id, email: response.email };
    const token = generateToken(jwtPayload)

    if (response.usertype === "recruter") {
      const plan = await Plans.findOne({ planName: "Free Plan" });

      if (plan) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.durationInDays);


        const subscription = new Subscription({
          recruiterId: response._id,
          planId: plan._id,
          startDate: startDate,
          endDate: endDate,
          jobsPosted: 0,
          jobPostLimit: plan.jobPostLimit,
          dbPoints: plan.dbPoints,
          isActive: true
        });

        const savedSubscription = await subscription.save();
        console.log("Subscription created:", savedSubscription);
      }
    }

    console.log("user signup sucessful from bACKEND");
    return res.status(200).json({
      message: "user signup sucessfuly",
      token: token
    })
  } catch (e) {
    console.log("error", e);
  }
});

router.post("/login", async (req, res) => {
  try {
    const data = req.body
    const user = await User.findOne({ useremail: data.useremail })
    if (!user || !(await user.comparePassword(data.password))) {
      return res.status(401).json({ msg: "Invalid Email or Password" })
    }
    const jwtPayload = { id: user.id, email: user.email }
    const token = generateToken(jwtPayload)
    console.log("Login Sucessfull !");
    // res.status(200).json({ msg: "User Login Successfully!", token: token });
    console.log("User Loggin Success", user)
    return res.status(200).json({
      msg: "User Logging Sccessful", token: token, usertype: user.usertype,
      username: user.username,
      useremail: user.useremail
    });
  }
  catch (e) {
    console.log("error", e);
  }
})

router.put("/update", jwtMiddleWare, async (req, res) => {
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

//  router.delete("/dlt",jwtMiddleWare,async(req,res)=>{
//   try{
//   const userId = req.jwtPayload.id
//   const response= await User.findOneAndDelete(
//     { _id: userId },                          
//   )
//   if(!response){
//     return res.status(404).json({msg:"user not found "})
//   }
//   console.log("User dlt Succssfully");  
//   return res.status(200).json({msg:"User dlt Succssfully",userDltData:response})
//   }
//   catch(e){
//       console.log("error",e);
//  return res.status(500).json({msg:"Internal Server Error"})
//   }
// })

// router.get("/getUser",jwtMiddleWare, async (req,res)=>{
// try{
//   const userId=req.jwtPayload.id;
//   const response = await User.findOne({_id: userId })
//     if(!response){
//       console.log("User Not Found!")
//       return res.status(404).json({msg:"User Not Found!"})
//     }
//     return res.status(200).json({user:response});   
// }catch(e){
//   console.log("Error",e)
//   return res.status(500).json({msg:"Internal Server Error"})
// }
// })

// router.post("/test", async (req, res) => {
//   try {
//     const data = req.body;
//     console.log("Received data:", data);

//     const newTest = new Test(data);
//     const response = await newTest.save();

//     console.log("Saved doc:", response);
//     return res.status(200).json({ msg: "Pass", data: response });
//   } catch (e) {
//     console.log("Error:", e);
//     return res.status(500).json({ msg: "Fail", error: e.message });
//   }
// });

// router.get("/getAllUser", async(req,res)=>{
// try{
// const response= await User.find();
// return res.status(200).json({users:response})
// }catch(e){
//   console.log("Error in get All",e)
//    return res.status(500).json({ msg: "Error", error: e.message });
// }

// })

// // In userRouter.js or jobRouter.js (better: userRouter because it's user-specific)

// // Save a job by jobseeker
// router.post("/savejob/:jobId", jwtMiddleWare, async (req, res) => {
//   try {
//     const userId = req.jwtPayload.id; // ✅ Correct field
//     const jobId = req.params.jobId;

//     // Check if job exists
//     const job = await Jobs.findById(jobId);
//     if (!job) {
//       return res.status(404).json({ message: "Job not found" });
//     }

//     // Update user's savedJobs array
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Prevent duplicate save
//     if (user.savedJobs.includes(jobId)) {
//       return res.status(400).json({ message: "Job already saved" });
//     }

//     user.savedJobs.push(jobId);
//     await user.save();

//     return res.status(200).json({
//       message: "Job saved successfully",
//       savedJobs: user.savedJobs
//     });
//   } catch (error) {
//     console.error("Error saving job:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });
// // get save job by jobseeker
// router.get("/savedJobs", jwtMiddleWare, async (req, res) => {
//   try {
//     const userId = req.jwtPayload.id; // ✅ Correct from JWT

//     // Find the user and populate saved jobs
//     const user = await User.findById(userId).populate("savedJobs");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // If no saved jobs
//     if (!user.savedJobs || user.savedJobs.length === 0) {
//       return res.status(404).json({ message: "No saved jobs found" });
//     }

//     return res.status(200).json({
//       message: "Saved jobs fetched successfully",
//       savedJobs: user.savedJobs
//     });
//   } catch (error) {
//     console.error("Error fetching saved jobs:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });
// // 


// // ------------------------------------------------------------------------
// ;

// // Recruiter saves an applied candidate
// router.put("/savecandidate/:userId", jwtMiddleWare, async (req, res) => {
//   try {
//     const saveuserId = req.params.userId;
//     const userId=req.jwtPayload.id;

//     const newsaveuser = await User.findById(saveuserId);
//     const user = await User.findById(userId);

//     if (!user|| !newsaveuser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//       if (user.savedCandidates.includes(saveuserId)) {
//       return res.status(400).json({ message: "Already saved to this " });
//     }

//       user.savedCandidates.push(saveuserId);
//      const result=  await user.save();
//      return res.status(200).json({ message: "Candidate saved successfully!", user:result});
//   } catch (error) {
//     console.error("Error saving applied candidate:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // get save candidates
// router.get("/getsavedcandidates",jwtMiddleWare,async(req,res)=>{
//   try{

//   }
//   catch(error){
//    console.error("Error saving applied candidate:", error);
//    return res.status(500).json({ message: "Internal Server Error" }); 
//   }
// })



// ------------------------------------------------------------------------

// save candidates 
// save candidate
// router.put("/savecandidate", jwtMiddleWare, async (req, res) => {
//   try {
//     const { jobId, candidateId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(candidateId)) {
//       return res.status(400).json({ msg: "Invalid jobId or candidateId" });
//     }

//     const candidate = await User.findById(candidateId);
//     if (!candidate) return res.status(404).json({ msg: "Candidate not found" });

//     const job = await Jobs.findById(jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found" });

//     if (!candidate.savedJobs.includes(jobId)) {
//       candidate.savedJobs.push(jobId);
//       await candidate.save();
//     }

//     return res.status(200).json({
//       msg: "Job saved to candidate successfully",
//       savedJobs: candidate.savedJobs
//     });

//   } catch (error) {
//     console.error("Save Candidate Error:", error);
//     return res.status(500).json({ msg: "Internal server error" });
//   }
// });

// get all saved candidates
// router.get("/allsavedcandidates", jwtMiddleWare, async (req, res) => {
//   try {
//     const recruiterId = req.jwtPayload.id;

//     const jobs = await Jobs.find({ jobCreatedby: recruiterId }).select("_id");
//     const jobIds = jobs.map(job => job._id);

//     const savedCandidates = await User.find({
//       savedJobs: { $in: jobIds }
//     }).select("-password");

//     if (!savedCandidates.length) {
//       return res.status(404).json({ msg: "No saved candidates found for your jobs." });
//     }

//     return res.status(200).json({
//       success: true,
//       count: savedCandidates.length,
//       candidates: savedCandidates
//     });

//   } catch (error) {
//     console.error("Get Saved Candidates Error:", error);
//     return res.status(500).json({ msg: "Internal server error" });
//   }
// });


// // GET saved candidates for a job
// router.get('/job/:jobId/saved-candidates', async (req, res) => {
//   const { jobId } = req.params;

//   try {
//     // Find the job and populate saved candidates
//     const job = await Jobs.findById(jobId).populate('savedCandidates', 'username useremail resume Skill qualification number designation yearsofExperience previousCompany previousSalary salaryExpectation');

//     if (!job) {
//       return res.status(404).json({ success: false, msg: 'Job not found' });
//     }

//     if (!job.savedCandidates || job.savedCandidates.length === 0) {
//       return res.status(200).json({ success: true, msg: 'No saved candidates', candidates: [] });
//     }

//     res.status(200).json({ success: true, candidates: job.savedCandidates });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, msg: 'Server error' });
//   }
// });


router.post("/invterview", jwtMiddleWare, async (req, res) => {
  try {

  } catch (e) {
    console.log("Error in interview", e)
  }

})


module.exports = router;





