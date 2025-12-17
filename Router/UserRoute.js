const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../model/User/UserSchema");
const Jobs = require("../model/User/jobSchema");
const Test = require("../model/User/TestSchema");
const bcrypt = require("bcrypt");
const {
  jwtMiddleWare,
  generateToken,
} = require("../middleware/jwtAuthMiddleware");
const Plans = require("../model/Plan/PlansSchema");
const Subscription = require("../model/Subscriptions/SubscriptionSchema");
const { sendEmail } = require("../utilitys/resend-mailer");
const validator = require("validator");
const upload = require("../config/multerConfig");

router.post("/signup", async (req, res) => {
  try {
    const data = req.body;

    if (!data.useremail || !validator.isEmail(data.useremail)) {
      return res.status(400).json({ error: "Invalid Email!" });
    }

    const existingUser = await User.findOne({ useremail: data.useremail });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists!" });
    }

    const newUser = new User(data);
    const response = await newUser.save();

    const token = generateToken({ id: response.id, email: response.email });

    // Add subscription for recruiters
    if (response.usertype === "recruter" || response.usertype === "recruiter") {
      const plan = await Plans.findOne({ planName: "Free Plan" });
      if (plan) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.durationInDays);

        await new Subscription({
          recruiterId: response._id,
          planId: plan._id,
          startDate,
          endDate,
          jobsPosted: 0,
          jobPostLimit: plan.jobPostLimit,
          dbPoints: plan.dbPoints,
          isActive: true,
        }).save();
      }
    }

    return res.status(200).json({
      message: "User signup successfully",
      token,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const data = req.body;
    const user = await User.findOne({ useremail: data.useremail });

    if (!user || !(await user.comparePassword(data.password))) {
      return res.status(401).json({ msg: "Invalid Email or Password" });
    }

    const token = generateToken({ id: user.id, email: user.email });

    return res.status(200).json({
      msg: "Login Successful",
      token,
      usertype: user.usertype,
      varification: user.isVerified,
      username: user.username,
      useremail: user.useremail,
      jobrole: user.designation,
      companyName: user.recruterCompany,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

// router.put(
//   "/update",
//   jwtMiddleWare,
//   upload.fields([
//     { name: "profilphoto", maxCount: 1 },
//     { name: "resume", maxCount: 1 },
//     { name: "introvideo", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       const userId = req.jwtPayload.id;
//       const userUpdatedData = {
//         ...req.body,
//         profilphoto:
//           req.files?.profilphoto?.[0]?.filename || req.body.profilphoto,
//         resume: req.files?.resume?.[0]?.filename || req.body.resume,
//         introvideo: req.files?.introvideo?.[0]?.filename || req.body.introvideo,
//       };

//       console.log("Incoming Data:", userUpdatedData);

//       const response = await User.findOneAndUpdate(
//         { _id: userId },
//         { $set: userUpdatedData },
//         { new: true, runValidators: true }
//       );

//       if (!response) {
//         return res.status(404).json({ msg: "User Not Found!" });
//       }

//       return res.status(200).json({
//         msg: "User Update Successfully",
//         UpdatedData: response,
//       });
//     } catch (e) {
//       console.error("error", e);
//       return res.status(500).json({ msg: "Internal Server Error" });
//     }
//   }
// );


router.put(
  "/update",
  jwtMiddleWare,
  upload.fields([
    { name: "profilphoto", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "introvideo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const userId = req.jwtPayload.id

      console.log("FILES:", req.files)
      console.log("BODY:", req.body)

      const userUpdatedData = { ...req.body }

      // TEMP: just store original file names
      if (req.files?.profilphoto) {
        userUpdatedData.profilphoto =
          req.files.profilphoto[0].originalname
      }

      if (req.files?.resume) {
        userUpdatedData.resume =
          req.files.resume[0].originalname
      }

      if (req.files?.introvideo) {
        userUpdatedData.introvideo =
          req.files.introvideo[0].originalname
      }

      const response = await User.findOneAndUpdate(
        { _id: userId },
        { $set: userUpdatedData },
        { new: true }
      )

      if (!response) {
        return res.status(404).json({ msg: "User Not Found!" })
      }

      return res.status(200).json({
        msg: "User Update Successfully",
        UpdatedData: response,
      })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ msg: "Internal Server Error" })
    }
  }
)

router.post("/send-otp", async (req, res) => {
  try {
    const { useremail } = req.body;

    if (!useremail || !validator.isEmail(useremail)) {
      return res.status(400).json({ msg: "Invalid Email" });
    }

    const user = await User.findOne({ useremail: useremail });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
    const text = `Your verification code is: ${otp}. It expires in 10 minutes.`;

    try {
      await sendEmail({ to: user.useremail, subject: "Your OTP code", text });
      //await sendEmail({ to: user.useremail, subject: 'Your OTP code', text });

      return res.status(200).json({ msg: "OTP sent to email" });
    } catch (err) {
      console.error("Error sending email:", err);
      return res.status(500).json({ msg: "Failed to send OTP email" });
    }
  } catch (e) {
    console.log("error", e);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { useremail, otp } = req.body;
  const user = await User.findOne({ useremail: useremail });
  if (!user || user.otp !== otp || user.otpExpires < Date.now())
    return res.status(400).json({ msg: "Invalid or expired OTP" });
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();
  res.json({ msg: "OTP verified" });
});

router.put("/reset-password", async (req, res) => {
  try {
    const { useremail, newPassword } = req.body;
    const user = await User.findOne({ useremail: useremail });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (e) {
    console.log("error", e);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.get("/finduser/:useremail", async (req, res) => {
  try {
    const usermail = req.params.useremail;

    if (!usermail || !validator.isEmail(usermail)) {
      return res.status(400).json({ msg: "Invalid Email" });
    }

    const response = await User.findOne({ useremail: usermail });
    if (!response) {
      console.log("User Not Found!");
      return res.status(404).json({ userFound: false });
    }
    return res.status(200).json({ userFound: true });
  } catch (e) {
    console.log("Error", e);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = router;
