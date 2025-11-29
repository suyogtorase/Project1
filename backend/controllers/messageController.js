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