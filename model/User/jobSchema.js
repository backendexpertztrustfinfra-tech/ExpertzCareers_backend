const mongoose = require("mongoose")

const jobSchema = mongoose.Schema({
    jobTitle: {
        type: String
    },
    jobCategory: {
        type: String
    },
    companyName: {
        type: String
    },

     companyLogo: {
    type: String, default: null
  },
    jobCreatedby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    description: {
        type: String
    },
    noofOpening: {
        type: String
    },
    jobType: {
        type: String
    },
    location: {
        type: String
    },
    address: {
        type: String
    },
    gender: {
        type: String
    },
    Qualification: {
        type: String
    },
    totalExperience: {
        type: String
    },
    relevantExperience: {
        type: String
    },
    SalaryIncentive: {
        type: String
    },
    jobBenefits: {
        type: String
    },
    jobSkills: {
        type: String
    },
    documentRequired: {
        type: String
    },
    timing: {
        type: String
    },
    shift: {
        type: String
    },
    workingDays: {
        type: String
    },
    weekend: {
        type: String
    },
    status: {
        type: String,
        enum: ["pending", "live", "close"],
        default: "pending"
    },

    appliedstatus: {
        type: String,
        default: null
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date
    },
    candidatesApplied: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            status: {
                type: String,
                enum: ["applied", "shortlisted", "rejected", "hired"],
                default: "applied"
            },
            appliedAt: { type: Date, default: Date.now } // optional: kab apply kiya
        }
    ]
    ,

    ClosedDate: {
        type: String,
        default: null
    },


}, { timestamps: true })

const Jobs = mongoose.model("Job", jobSchema)
module.exports = Jobs
