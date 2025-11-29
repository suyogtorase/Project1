import { transporter } from "../config/mail.js";
import userModel from "../models/userModel.js"
import dotenv from "dotenv";

// get admin Data
export const getAdminData = async(req, res) => {
    const admin = req.admin;
    
    try {
        if(!admin){
            return res.status(400).json({success: false, message: "Admin not found"});
        }

        res.status(200).json({
            success: true,
            admin
        });
        
    } catch (error) {
        console.log("Error in getAdminData, ", error);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}

// get all the request
export const getAllPendingRequest = async(req, res) => {
    try {
        const pendingRequests = await userModel.find({
            role : "Teacher",
            isVerifiedByAdmin: false
        });

        res.status(200).json({success: true, message: "List is given", pendingRequests});
    } catch (error) {
        console.log("Error in getAllPendingRequests ", error);
        res.status(500).json({success: false, message: "Internal server error"});
    }
};

// accept the request and send mail
export const acceptRequest = async(req, res) => {
    const { id } = req.params;

    if(!id){
        return res.status(400).json({success: false, message: "Id not found"});
    }

    try {
        const user = await userModel.findById(id);

        if(!user){
            return res.status(404).json({success: false, message: "User not found"});
        }

        user.isVerifiedByAdmin = true;
        await user.save();
        
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: user.email,
            subject: "Request accepted by admin",
            text: `Dear ${user.name} your request has been accepted by admin`
        }

        await transporter.sendMail(mailOptions);

        res.status(200).json({success: true, message: "Accepted request"});

    } catch (error) {
        console.log("Error in acceptRequest, ", error);
        res.status(500).json({success: false, message: "Internal server Error"});
    }
};

// reject the request and send mail
export const rejectRequest = async(req, res) => {
    const { id } = req.params;

    if(!id){
        return res.status(404).json({success: false, message: "Id not found"});
    }

    try {
        const user = await userModel.findById(id);

        if(!user){
            return res.status(400).json({success: false, message: "User not found"});
        }

        user.isVerifiedByAdmin = false;
        await user.save();

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: user.email,
            subject: "Request rejected by admin",
            text: `Dear ${user.name} your request has been rejected by admin`
        }

        await transporter.sendMail(mailOptions);

        res.status(200).json({success: true, message: "Rejected request"});

    } catch (error) {
        console.log("Error in rejectRequest, ", error);
        res.status(500).json({success: false, message: "Internal server Error"});
    }
};

