import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
dotenv.config();
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import authRouter from "./routes/authRoutes.js";
import {connectDB} from "./config/mongodb.js";
import userRouter from "./routes/userRoute.js";
import adminRouter from "./routes/adminRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

// create express app and server
const app = express();
const server = http.createServer(app)

// Initialize socket.io server
const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:5173",
];

export const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    }
})

// store online users
export const userSocketMap = {}; // {userId: socketId}

// Socket.io connection handler
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected ", userId)

    if(userId) userSocketMap[userId] = socket.id

    // emit online users to all connected users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", ()=>{
        console.log("User Disconnected, ", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

const port = process.env.PORT || 4000;
connectDB();

app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({extended: true, limit: "10mb"}));
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}))

// API Endpoints
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/admin', adminRouter)
app.use('/api/messages', messageRouter)

server.listen(port, ()=>{
    console.log(`Server running on http://localhost:${port}`);
});