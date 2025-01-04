import express from "express"
import mongoose from "mongoose"
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import { userData } from "./model/user.model.js"
import {verifyJwt} from "./middleware/auth.middlewares.js"

const app = express()  
dotenv.config()
app.use(cors({
    // origin: 'http://localhost:5173',
    origin: 'https://smart-hire-fronted-m3bzsmqg7-amarjeetsharma6802s-projects.vercel.app',
    // origin: 'https://interview-task-swart.vercel.app',
    credentials: true, 
}));
app.use(express.json())
app.use(cookieParser())
  


const connectDb = async()=>{
    try {
        const connect = await mongoose.connect(process.env.DB_ATLES,)
        console.log(`MongoDB Connected: ${connect.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

connectDb()

app.post("/api/Smartuser", async (req, res)=>{
    try {
        const {name, phone, email,password} = req.body

        if(!name || !phone || !email || !password){
            return res.status(400).json({message: "All fields are required"})
        }
        const ExsitUser = await userData.findOne({
            $or: [{email: email}, {phone: phone}]
        })
        if(ExsitUser){
            return res.status(400).json({message: "User already exist"})
        }
        const hashedPassword = await bcrypt.hash(password,10) 

        const user = await userData.create({
            name,
            phone,
            email,
            password: hashedPassword,
        })

    const accessToken = jwt.sign({_id: user._id ,email:user.email},
        process.env.JWT_SECRET_TOKEN, 
        {expiresIn: "1d"}
     )
       
     const createUser = await userData.findById(user._id).select("-password")

        return res.status(201).json({
            accessToken,
            message: "User submitted successfully",
            createUser
        })  

    } catch (error) {
        console.error("Error occurred: ", error.message);
        return res.status(500).json({ message: error.message });
    }

})  
app.post("/api/SmartuserLogin",async(req,res)=>{
    
    const { email,password} = req.body

    if(!email || !password){
        return res.status(400).json({message: "All fields are required"})
    }  

    const user = await userData.findOne({email: email})
    if(!user){
        return res.status(400).json({message: "User does not exist"})
    }
  
const passwordMatch = await bcrypt.compare(password, user.password)

if(!passwordMatch){
    return res.status(400).json({message: "Invalid credentials"})}

    const accessToken = jwt.sign({_id: user._id ,email:user.email},
        process.env.JWT_SECRET_TOKEN, 
        {expiresIn: "1d"}
     ) 
console.log(accessToken)
     
     return res.status(201)
     .cookie("accessToken",accessToken,{httpOnly:true,secure:true } )
     .json({
        user:{_id: user._id, name: user.name, email: user.email},
        accessToken,
        message: "User logged in successfully",
        
        })

} ) 

app.post("/api/smarthireLogout", verifyJwt , async(req,res)=>{

    await userData.findByIdAndUpdate({_id: req.user._id}, {$unset: {accessToken: 1}}, {new: true});

return res.status(201)
.clearCookie("accessToken",{httpOnly:true,secure:true})
.json({message: "User logged out successfully"})
})

app.get("/api/smarthireUserget", verifyJwt, async(req,res)=>{
    try {
        return res.status(201).json({
            user: req.user,
            message: "User fetched successfully"
        })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
})

app.post("/api/changePassword",verifyJwt,async(req,res)=>{
    try {
        const {oldPassword,newPassword} = req.body

        if(!oldPassword ||!newPassword){
            return res.status(400).json({message: "Please fill all fields"})
        }
        const user = await userData.findById(req.user?._id) 

        if(!user){
            return res.status(401).json({ message: "User not found" });

        }
        const passwordMatch = await bcrypt.compare(oldPassword, user.password)


        if (!passwordMatch) {
            return res.status(400).json({ message: "Old password does not match" });
        }
       user.password = await bcrypt.hash(newPassword,10);
       await user.save({ validateBeforeSave: false })

       return res.status(201).json({message: "Password changed successfully"})
    } catch (error) {
         console.error("Error changing password:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
})

app.patch("/api/updateAccount" ,verifyJwt ,async(req,res)=>{
    try {
        const {name,email,phone} =req.body
        if(!name || !email ||! phone){
            return res.status(400).json({message: "Please fill all fields"})
        }
        const user = await userData.findByIdAndUpdate(
            req.user?._id,{
                $set :{
                    name:name,
                    email:email,
                    phone:phone
                }
            },{
                new:true
            }
        ).select("-password")
        return res.status(201).json({message: "Account updated successfully",user})
    } catch (error) {
        res.status(500).json({mesaage:"Account details not updated successfully"})
    }
})
 


app.listen(5000, ()=>{
    console.log("Server is running on port 5000")
})

export default app;  
