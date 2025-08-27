const mongoose = require("mongoose")

const jobSchema = mongoose.Schema({
    jobTitle:{
        type:String
    },
     jobCategory:{
        type:String
    },
    jobCreatedby:{
         type: mongoose.Schema.Types.ObjectId,
          ref: "User" ,
         default:null
        },
      description:{
          type:String
      },
     noofOpening:{
        type:String
    },
     jobType:{
        type:String
    },
     location:{
        type:String
    },
     address:{
        type:String
    },
    gender:{
        type:String
    },
    Qualification:{
        type:String
    },
    totalExperience:{
        type:String
    },
    relevantExperience:{
        type:String
    },
    SalaryIncentive:{
        type:String
    },
    jobBenefits:{
        type:String
    },
    jobSkills:{
        type:String
    },
    documentRequired:{
        type:String
    },
    timing:{
        type:String
    },
    shift:{
        type:String
    },
    workingDays:{
        type:String
    },
    weekend:{
        type:String
    },
    status:{
        type:String,
<<<<<<< HEAD
        default:"pending"
    },
=======
        enum:["pending","live","close"],
        default:"pending"
    },
   createdAt:{ 
     type: Date,
     default: Date.now 
    },
   expiryDate:{ 
    type: Date 
    } ,
>>>>>>> fbe4f84 (Fixing Recruiter APIs)
    candidatesApplied:{
        type:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" ,default:null}],
    },
    
    ClosedDate:{
        type:String,
        default:null
    },
    savedCandidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
<<<<<<< HEAD
}]
=======
}],

>>>>>>> fbe4f84 (Fixing Recruiter APIs)
    
},{ timestamps: true })

const Jobs = mongoose.model("Job",jobSchema)
module.exports=Jobs