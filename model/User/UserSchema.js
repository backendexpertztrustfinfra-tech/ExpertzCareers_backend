const mongoose=require("mongoose")
const bcrypt = require("bcrypt")

const UserSchema = mongoose.Schema({
     username:{
        type:String,default:null
    },
     useremail:{
        type:String,default:null
    },
    password:{
        type:String,default:null
    },
    usertype:{
        type:String,
        enum:["jobseeker","recruter"],
        default:null
    },
    resume:{
     type:String
    },
    Skill:{
      type:String
    },
    qualification:{
      type:String
    },
    number:{
      type:String
    },
    designation:{
        type:String,default:null
    },
    yearsofExperience:{
        type:String,
        default :null
      },
    previousCompany:{
        type:String,default:null
    },
    previousSalary:{
        type:String,default:null
    },
    salaryExpectation:{
        type:String,default:null 
    }, 
    recruterPhone:{
        type:String,default:null
    },
      recruterCompany:{
        type:String,default:null
    },
     recruterCompanyType:{
        type:String,default:null,
        enum:["Proprietorship","Partnership","OPC","LLP","PVT LTD","LTD"]   
     },
     recruterGstIn:{
       type:String,
       default:null
     },
    // recruterDoyouhaveaGSTNumber:{
    //     type:String,
    //      enum:["yes","no"]
    // }
    recruterCompanyAddress:{
        type:String,default:null
    },
    recruterLogo:{
        type:String,default:null
    },
     recruterIndustry:{
        type:String,default:null
    },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    savedCandidates: [{ type: mongoose.Schema.Types.ObjectId,ref: "User",default: null}],
})

UserSchema.pre("save", async function (next) {
    const user = this; // ✅ 'this' refers to the document
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

const Users = mongoose.model("User",UserSchema);
module.exports=Users;









