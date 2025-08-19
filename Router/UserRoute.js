const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const User = require("../model/User/UserSchema") 
const Test = require("../model/User/TestSchema")
const { jwtMiddleWare, generateToken } = require("../middleware/jwtAuthMiddleware");


router.post("/signup",async (req,res)=>{
    try{
        const data= req.body;
     // console.log("UsernAME:",data.username)
        const newUser = new User(data);
        const response = await newUser.save();
         
          const jwtPayload = { id: response.id, email: response.email };
          const token = generateToken(jwtPayload)

        console.log("user signup sucessful from bACKEND");
        return res.status(200).json({
        message:"user signup sucessfuly",
        token:token })
    }catch(e){
        console.log("error",e);
    }
});

router.post("/login",async (req,res)=>{
    try{
      const data = req.body
      const user = await User.findOne({useremail:data.useremail})
      if(!user || !(await user.comparePassword(data.password))){
        return res.status(401).json({msg:"Invalid Email or Password"})
      }
      const jwtPayload={id:user.id,email:user.email }
     const token = generateToken(jwtPayload)
     console.log("Login Sucessfull !");
    // res.status(200).json({ msg: "User Login Successfully!", token: token });
      console.log("User Loggin Success",user)
      return res.status(200).json({msg:"User Logging Sccessful",token:token,usertype: user.usertype,   
      username: user.username,  
      useremail: user.useremail}); 
    }
    catch(e){
      console.log("error",e);
    }
})



router.put("/update",jwtMiddleWare,async (req,res)=>{
try{
  const userId=req.jwtPayload.id
  const userUpdatedData=req.body
  
  const response = await User.findOneAndUpdate(
  { _id: userId },             
  userUpdatedData,             
  {
    new: true,                 
    runValidators: true        
  }
)
  if(!response){
    return res.status(404).json({msg:"User Not Found!"})
  }
  console.log("User Update Succssfully");  
  return res.status(200).json({msg:"User Update Succssfully",UpdatedData:response})
}
catch(e){
 console.log("error",e);
 return res.status(500).json({msg:"Internal Server Error"})

 }
});

 router.delete("/dlt",jwtMiddleWare,async(req,res)=>{
  try{
  const userId = req.jwtPayload.id
  const response= await User.findOneAndDelete(
    { _id: userId },                          
  )
  if(!response){
    return res.status(404).json({msg:"user not found "})
  }
  console.log("User dlt Succssfully");  
  return res.status(200).json({msg:"User dlt Succssfully",userDltData:response})
  }
  catch(e){
      console.log("error",e);
 return res.status(500).json({msg:"Internal Server Error"})
  }
})

router.get("/getUser",jwtMiddleWare, async (req,res)=>{
try{
  const userId=req.jwtPayload.id;
  const response = await User.findOne({_id: userId })
    if(!response){
      console.log("User Not Found!")
      return res.status(404).json({msg:"User Not Found!"})
    }
    return res.status(200).json({user:response});   
}catch(e){
  console.log("Error",e)
  return res.status(500).json({msg:"Internal Server Error"})
}
})


router.post("/test", async (req, res) => {
  try {
    const data = req.body;
    console.log("Received data:", data);

    const newTest = new Test(data);
    const response = await newTest.save();

    console.log("Saved doc:", response);
    return res.status(200).json({ msg: "Pass", data: response });
  } catch (e) {
    console.log("Error:", e);
    return res.status(500).json({ msg: "Fail", error: e.message });
  }
});


router.get("/getAllUser", async(req,res)=>{
try{
const response= await User.find();
return res.status(200).json({users:response})
}catch(e){
  console.log("Error in get All",e)
   return res.status(500).json({ msg: "Error", error: e.message });
}

})








module.exports = router;





