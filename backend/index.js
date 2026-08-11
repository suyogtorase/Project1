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
import testRouter from "./routes/testRoutes.js";
import announcementRouter from "./routes/announcementRoutes.js";
import scheduleRouter from "./routes/scheduleRoutes.js";
import startScheduleCleanupJob from "./jobs/scheduleCleanup.js";

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

    // Classroom Group Chat Rooms
    socket.on("joinClassroom", (classroomId) => {
        socket.join(classroomId);
        console.log(`User ${userId} joined room: ${classroomId}`);
    });

    socket.on("leaveClassroom", (classroomId) => {
        socket.leave(classroomId);
        console.log(`User ${userId} left room: ${classroomId}`);
    });

    // WebRTC Live Classroom Signaling
    socket.on("join-live-class", (roomId) => {
        socket.join(roomId);
        console.log(`User ${userId} joined Live Class room: ${roomId}`);
        socket.to(roomId).emit("user-joined", { userId, socketId: socket.id });
    });

    socket.on("webrtc-offer", ({ targetSocketId, offer }) => {
        socket.to(targetSocketId).emit("webrtc-offer", {
            senderSocketId: socket.id,
            offer,
            senderUserId: userId
        });
    });

    socket.on("webrtc-answer", ({ targetSocketId, answer }) => {
        socket.to(targetSocketId).emit("webrtc-answer", {
            senderSocketId: socket.id,
            answer,
        });
    });

    socket.on("webrtc-ice-candidate", ({ targetSocketId, candidate }) => {
        socket.to(targetSocketId).emit("webrtc-ice-candidate", {
            senderSocketId: socket.id,
            candidate,
        });
    });

    socket.on("leave-live-class", (roomId) => {
        socket.leave(roomId);
        console.log(`User ${userId} left Live Class room: ${roomId}`);
        socket.to(roomId).emit("user-left", { socketId: socket.id, userId });
    });

    socket.on("disconnect", ()=>{
        console.log("User Disconnected, ", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        // Tell everyone this socket left so WebRTC can clean up
        socket.broadcast.emit("user-left", { socketId: socket.id, userId });
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
app.use('/api/tests', testRouter)
app.use('/api/announcements', announcementRouter)
app.use('/api/schedule', scheduleRouter)

// Start cron jobs
startScheduleCleanupJob();

server.listen(port, ()=>{
    console.log(`Server running on http://localhost:${port}`);
});