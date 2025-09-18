import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongo_url = process.env.MONGO_URI;

export const connectDB = async () => {
    await mongoose.connect(mongo_url)
        .then(()=>{
            console.log("Mongo Conected");
        }).catch((err)=>{
            console.log("Error in connectDB, ",err);
        })
};