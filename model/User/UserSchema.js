const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const UserSchema = mongoose.Schema({
  username: {
    type: String, default: null
  },
  otp: String,
  otpExpires: Date,
  isVerified: { type: Boolean, default: false },
  useremail: {
    type: String, default: null,
    unique: true,
    required: true
  },
  password: {
    type: String, default: null
  },
  usertype: {
    type: String,
    enum: ["jobseeker", "recruiter"],
    default: null
  },
  resume: {
    type: String
  },
  Skill: {
    type: String
  },
  qualification: {
    type: String
  },
  phonenumber: {
    type: String
  },
  designation: {
    type: String, default: null
  },
  location: { type: String, default: null },
  introvideo: {
    type: String,
    default: null
  },
  Experience: {
    type: String,
    default: null
  },
  projectlink: {
    type: String,
    default: null
  },
  certificationlink: {
    type: String,
    default: null
  },
  portfioliolink: {
    type: String,
    default: null
  },
  salaryExpectation: {
    type: String, default: null
  },
  recruterPhone: {
    type: String, default: null
  },
  recruterCompany: {
    type: String, default: null
  },
  recruterCompanyType: {
    type: String, default: null,
    enum: ["Proprietorship", "Partnership", "OPC", "LLP", "PVT LTD", "LTD"]
  },
  recruterCompanyDoc: {
    type: String, default: null
  },

  recruterGstIn: {
    type: String,
    default: null
  },

  recruterCompanyAddress: {
    type: String, default: null
  },
  profilphoto: {
    type: String, default: null
  },

  recruterIndustry: {
    type: String, default: null
  },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  savedCandidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }],


})

UserSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password"))
    return next();
  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (e) {
    next(e);
  }
});

UserSchema.methods.comparePassword = async function (canditdatePassword) {
  try {
    const isMatch = await bcrypt.compare(canditdatePassword, this.password);
    return isMatch;
  } catch (e) {
    throw e;
  }
}

const Users = mongoose.model("User", UserSchema);
module.exports = Users;









