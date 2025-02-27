import mongoose from "mongoose";
import dotenv from "dotenv";

const connectDB = async() =>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connection SUCCESS');
    } catch (error) {
        console.log(error);
        
    }
}

export default connectDB