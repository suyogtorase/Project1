import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";

import authRouter from "./routes/authRoutes.js";
import {connectDB} from "./config/mongodb.js";
import userRouter from "./routes/userRoute.js";

const app = express();
const port = process.env.PORT || 4000;
connectDB();

const allowedOrigins = ['http://localhost:5173']

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}))

// API Endpoints
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.get('/', (req, res)=>{ 
    res.send("API working")
});

app.listen(port, ()=>{
    console.log(`Server running on http://localhost:${port}`);
});