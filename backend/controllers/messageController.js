import messageModel from "../models/messageModel.js";
import userModel from "../models/userModel.js";
import cloudinary from "../utils/cloudinary.js";
import { io, userSocketMap } from "../index.js";

// get all users expect logged in user
export const getUsersForSideBar = async(req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await userModel.find({_id: {$ne: userId}}).select("-password");

        // count number of messages not seen
        const unseenMessages = {}
        const promises = filteredUsers.map(async (user)=> {
            const messages = await messageModel.find({senderId: user._id, receiverId: userId, seen: false})
            if(messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);

        res.status(200).json({success: true, users: filteredUsers, unseenMessages})
    } catch (error) {
        console.log("Error in getUsersForSideBar ", error.message);
        res.json({success: false, message: "Internal server Error"})
    }
}

//get all messages for selected user
export const getMessages = async(req, res) => {
    try {
        const {id: selectedUserId} = req.params;
        const myId = req.user._id;

        const messages = await messageModel.find({
            $or: [
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId},
            ]
        })
        await messageModel.updateMany({senderId: selectedUserId, receiverId: myId}, {seen: true});
        
        res.json({success: true, messages})
    } catch (error) {
        console.log("Error in getMessages ", error.message);
        res.status(500).json({success: false, message: "Internal server Error"})
    }
}

// api to mark message as seen using message id
export const markMessagesAsSeen = async(req, res)=> {
    try {
        const { id } = req.params;
        await messageModel.findByIdAndUpdate(id, {seen: true})
        res.json({success: true})
    } catch (error) {
        console.log("Error in markMessagesAsSeen ", error.message);
        res.status(500).json({success: false, message: "Internal server Error"})
    }
}

// send message to selected user
export const sendMessage = async(req, res) => {
    try {
        const {text, image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id

        let imageUrl;
        if(image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await messageModel.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        // emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];

        if(receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res.json({success: true, newMessage});

    } catch (error) {
        console.log("Error in sendMessage ", error.message);
        res.status(500).json({success: false, message: "Internal server Error"})
    }
}

export const getAllImages = async(req, res) => {
    try {
        const myId = req.user._id;
        const selectedUserId = req.params.id;

        const messages = await messageModel.find({
            $or: [
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId},
            ],
            image: { $exists: true, $ne: null, $ne: "" }
        }).select("image").sort({ createdAt: -1 });

        const images = messages.map(msg => msg.image).filter(img => img);

        res.status(200).json({success: true, images})
    } catch (error) {
        console.log("Error in getAllImages, ", error);
        res.status(500).json({success: false, message: "Internal server error"})
    }
}

import classroomModel from "../models/classroomModel.js";
import classroomMessageModel from "../models/classroomMessageModel.js";

// get messages for a specific classroom
export const getClassroomMessages = async (req, res) => {
    try {
        const { classroomId } = req.params;
        const user = req.user;

        const classroom = await classroomModel.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ success: false, message: "Classroom not found" });
        }

        // Authorization check
        let isAuthorized = false;
        if (user.role === "Administrator" && String(classroom.createdBy) === String(user._id)) {
            isAuthorized = true;
        } else if (user.role === "Teacher") {
            isAuthorized = classroom.teachers.some(t => String(t) === String(user._id));
        } else if (user.role === "Student") {
            isAuthorized = classroom.students.some(s => String(s.user) === String(user._id));
        }

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: "Unauthorized to view this classroom's messages" });
        }

        const messages = await classroomMessageModel.find({ classroomId })
            .populate('senderId', 'name profilePic role')
            .sort({ createdAt: 1 });

        res.json({ success: true, messages });
    } catch (error) {
        console.log("Error in getClassroomMessages", error.message);
        res.status(500).json({ success: false, message: "Internal server Error" });
    }
};

// send a message to a classroom group
export const sendClassroomMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const { classroomId } = req.params;
        const user = req.user;

        if (user.role === "Administrator") {
            return res.status(403).json({ success: false, message: "Administrators cannot send messages in classrooms" });
        }

        const classroom = await classroomModel.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ success: false, message: "Classroom not found" });
        }

        // Authorization check to SEND
        let isAuthorized = false;
        if (user.role === "Teacher") {
            isAuthorized = classroom.teachers.some(t => String(t) === String(user._id));
        } else if (user.role === "Student") {
            isAuthorized = classroom.students.some(s => String(s.user) === String(user._id));
        }

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: "Unauthorized to send messages in this classroom" });
        }

        const newMessage = await classroomMessageModel.create({
            senderId: user._id,
            classroomId,
            text
        });

        // Fetch the populated message to ensure it's sent correctly via socket
        const populatedMessage = await classroomMessageModel.findById(newMessage._id).populate('senderId', 'name profilePic role');

        // Emit to the classroom Socket.io room
        io.to(classroomId).emit("newClassroomMessage", populatedMessage);

        res.json({ success: true, newMessage: populatedMessage });
    } catch (error) {
        console.log("Error in sendClassroomMessage", error.message);
        res.status(500).json({ success: false, message: "Internal server Error" });
    }
};