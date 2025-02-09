import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config(); 
export const connectDB = async () => {
    try {
       const connect =await mongoose.connect(process.env.MONGODB)
        console.log("connected to database" );
        
    } catch (error) {
        console.log(error.message);
    }
}