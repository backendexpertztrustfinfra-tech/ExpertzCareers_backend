const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const User = require("../model/User/UserSchema")
const Jobs = require("../model/User/jobSchema");
const { jwtMiddleWare, generateToken } = require("../middleware/jwtAuthMiddleware");
const { jobStatusMiddleware } = require("../middleware/jobStatusMiddleware");
const upload = require('../middleware/imageUploadMiddle');
const Plans = require("../model/Plan/PlansSchema")
const Subscription = require("../model/Subscriptions/SubscriptionSchema")
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payments = require("../model/Payments/PaymentsSchema")

require("dotenv").config();

const razorpay = new Razorpay({
    key_id: process.env.API_KEY,
    key_secret: process.env.API_SECRET
});


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
        const response = await Jobs.findOne({
            _id: jobId,
            jobCreatedby: userId
        })
            .populate({
                path: "candidatesApplied.userId",   // nested populate
                select: "-password -recruterPhone -recruterCompany -recruterCompanyType -recruterCompanyAddress -recruterLogo -recruterIndustry -recruterGstIn -recruterCompanyDoc -savedJobs" // jo fields exclude karne hain
            });

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



router.put("/updateRecruiterProfile", upload.fields([
    { name: "profilphoto", maxCount: 1 }, // ek photo
    { name: "recruterCompanyDoc", maxCount: 1 } // multiple documents allow
]), jwtMiddleWare, async (req, res) => {
    try {
        const userId = req.jwtPayload.id
        const userUpdatedData = req.body


        if (req.files["profilphoto"] && req.files["profilphoto"][0]) {
            userUpdatedData.profilphoto = `/uploads/${req.files["profilphoto"][0].filename}`;
        }
        if (req.files["recruterCompanyDoc"] && req.files["recruterCompanyDoc"][0]) {
            userUpdatedData.recruterCompanyDoc = `/uploads/${req.files["recruterCompanyDoc"][0].filename}`;
        }

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
        return res.status(200).json({ msg: "User Update Succssfully" })
    }
    catch (e) {
        console.log("error", e);
        return res.status(500).json({ msg: "Internal Server Error" })

    }
});



router.get("/getallAppliedCandidatees", jwtMiddleWare, async (req, res) => {
    try {
        const userId = req.jwtPayload.id;
        const jobs = await Jobs.find({ jobCreatedby: userId })
        if (!jobs) {
            return res.status(404).json({ message: "No jobs found" });
        }
        let allCandidates = [];
        jobs.forEach(job => {
            allCandidates = [...allCandidates, ...job.candidatesApplied]
        })

        return res.status(200).json({
            message: "All Applied Candidates fetched successfully",
            candidates: allCandidates.length
        });

    } catch (e) {
        console.log("error", e);
        return res.status(500).json({ msg: "Internal Server Error" })
    }

})


router.post("/createplan", async (req, res) => {
    try {
        const planData = req.body;

        const newPlan = new Plans(planData)
        const savedPlan = await newPlan.save();
        return res.status(201).json({ msg: "Plan created successfully", plan: savedPlan })

    } catch (e) {
        console.log("error", e);
        return res.status(500).json({ msg: "Internal Server Error" })
    }
})


router.put("/updateapplyjobstatus/:jobId", jwtMiddleWare, async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const { candidateId, status } = req.body;
        const userId = req.jwtPayload.id;
        const job = await Jobs.findOne({ _id: jobId, jobCreatedby: userId });
        if (!job) {
            return res.status(404).json({ msg: "Job Not Found!" })
        }
        const candidate = job.candidatesApplied.find(candidate => candidate.userId.equals(candidateId));;
        if (!candidate) {
            return res.status(404).json({ msg: "Candidate Not Found!" })
        }
        candidate.status = status;
        await job.save();

        return res.status(200).json({ msg: "Candidate status updated successfully", candidate: candidate })


    } catch (e) {
        console.log("error", e);
        return res.status(500).json({ msg: "Internal Server Error" })
    }
})

// router.post("/buyplan", jwtMiddleWare, async (req, res) => {
//     try {
//         const userId = req.jwtPayload.id;
//         const { planName } = req.body;
//         const plan = await Plans.findOne({ planName: planName });
//         if (!plan) {
//             return res.status(404).json({ msg: "Plan Not Found!" })
//         }
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ msg: "User Not Found!" })
//         }


//         await Subscription.updateMany(
//             { recruiterId: userId, isActive: true },
//             { $set: { isActive: false } }
//         );


//         const startDate = new Date();
//         const endDate = new Date();
//         endDate.setDate(startDate.getDate() + plan.durationInDays);


//         const subscription = new Subscription({
//             recruiterId: userId,
//             planId: plan._id,
//             startDate: startDate,
//             endDate: endDate,
//             jobsPosted: 0,
//             jobPostLimit: plan.jobPostLimit,
//             isActive: true
//         });
//         const savedSubscription = await subscription.save();
//         return res.status(201).json({ msg: "Plan Purchased Successfully!", subscription: savedSubscription })

//     } catch (e) {
//         console.log("error", e);
//         return res.status(500).json({ msg: "Internal Server Error" })
//     }
// })

router.post('/create-order', jwtMiddleWare, async (req, res) => {
    const { amount } = req.body;
    const userId = req.jwtPayload.id;

    const options = {
        amount: amount * 100,
        currency: 'INR',
        receipt: `rcptid_${Date.now()}`,
        payment_capture: 1
    };

    try {

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "User Not Found!" })
        }

        const order = await razorpay.orders.create(options);

        console.log("Order Created Succefuly")

        res.json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            userDetails: {
                name: user.username,
                email: user.useremail,
                contact: user.phonenumber || "9999999999" // fallback number if null
            }
        });

    } catch (err) {
        console.error("Razorpay Order Creation Error:", err);
        res.status(500).send("Order creation failed");
    }
});




router.get("/getActiveSubscription", jwtMiddleWare, async (req, res) => {
    try {

        const userId = req.jwtPayload.id;
        const activeSubscription = await Subscription.findOne({ recruiterId: userId, isActive: true })
        if (!activeSubscription) {
            return res.status(404).json({ msg: "No Active Subscription Found!" })
        }

        return res.status(200).json({ msg: "Active Subscription Fetched Successfully!", subscription: activeSubscription })

    } catch (e) {
        console.log("error", e);
        return res.status(500).json({ msg: "Internal Server Error" })
    }
})


router.post("/payment-success", jwtMiddleWare, async (req, res) => {
    try {
        const userId = req.jwtPayload.id;
        const { payment_id, order_id, signature, planName, amount } = req.body;

        var amountInRupees = amount / 100

        //  Signature verification
        const generated_signature = crypto
            .createHmac("sha256", process.env.API_SECRET)
            .update(order_id + "|" + payment_id)
            .digest("hex");

        if (generated_signature !== signature) {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        const plan = await Plans.findOne({ planName: planName });
        if (!plan) {
            return res.status(404).json({ msg: "Plan Not Found!" })
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "User Not Found!" })
        }


        await Subscription.updateMany(
            { recruiterId: userId, isActive: true },
            { $set: { isActive: false } }
        );


        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.durationInDays);


        const subscription = new Subscription({
            recruiterId: userId,
            planId: plan._id,
            startDate: startDate,
            endDate: endDate,
            jobsPosted: 0,
            jobPostLimit: plan.jobPostLimit,
            dbPoints: plan.dbPoints,
            isActive: true
        });

        const savedSubscription = await subscription.save();

        // return res.status(201).json({ msg: "Plan Purchased Successfully!", subscription: savedSubscription })


        const payment = new Payments({
            userId: userId,
            subscriptionId: subscription._id,
            amount: amountInRupees,
            transactionId: payment_id,
            status: "completed",
            paymentDate: startDate,

        });


        await payment.save();

        // const user = await Users.findById(userId);
        // const ant=amount / 100;
        // const date=new Date();

        //     await sendEmail(user.email, 'Payment Successful - ILAMED', `<h1>Hi ${user.username},</h1><p>Thank you for your payment!</p><p>Your transaction has been completed successfully.</p><h3>Payment Details:</h3><ul>
        //       <li><strong>Amount Paid:</strong> ₹${ant}</li>
        //       <li><strong>Payment ID:</strong> ${payment_id}</li>
        //       <li><strong>Date:</strong> ${date}</li>
        //     </ul><p>You can now access your purchased course/content.</p>
        //    <p>If you have any questions, feel free to reach out to us at <a href="mailto:info@ilamed.org">support@ilamed.com</a>.</p>
        //    <p>Thanks,<br>The ILAMED Team</p>`);

        res.json({ success: true, message: "Payment Done" });

    } catch (err) {
        console.error("Payment success error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});



router.get("/getPaymentHistory", jwtMiddleWare, async (req, res) => {
    try {
        const userId = req.jwtPayload.id;
        const payments = await Payments.find({ userId: userId }).populate("subscriptionId")
        if (!payments) {
            return res.status(404).json({ msg: "No Payment History Found!" })
        }
        return res.status(200).json({ msg: "Payment History Fetched Successfully!", payments: payments })

    } catch (e) {
        console.log("error", e);
        return res.status(500).json({ msg: "Internal Server Error" })
    }
})


router.get("/dbpointUser", jwtMiddleWare, async (req, res) => {
    try {
        const userId = req.jwtPayload.id;
        const activeSubscription = await Subscription.findOne({ recruiterId: userId, isActive: true })
        if (!activeSubscription) {
            return res.status(404).json({ msg: "No Active Subscription Found!" })
        }
        const allowedPoints = activeSubscription.dbPoints || 0;

        const dbUsers = await User.find({ usertype: "jobseeker" })
            .select(
                "-password -recruterPhone -recruterCompany -recruterCompanyType -recruterCompanyAddress -recruterLogo -recruterIndustry"
            ).limit(allowedPoints);;

        if (!dbUsers) {
            return res.status(404).json({ msg: "No Users Found!" })
        }
        return res.status(200).json({ msg: "DB Users Fetched Successfully!", users: dbUsers })

    } catch (e) {
        console.log("error", e);
        return res.status(500).json({ msg: "Internal Server Error" })
    }

})











module.exports = router;