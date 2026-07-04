import { transporter } from "../config/mail.js";
import userModel from "../models/userModel.js"
import instituteModel from "../models/instituteModel.js";
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
        const pendingRequests = await instituteModel.find({
            status : "Pending"
        }).populate("administrator", "name email");

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
        const institute = await instituteModel.findById(id).populate("administrator");

        if(!institute){
            return res.status(404).json({success: false, message: "Institute not found"});
        }

        institute.status = "Approved";
        await institute.save();
        
        if (institute.administrator) {
            const adminUser = await userModel.findById(institute.administrator._id);
            if (adminUser) {
                adminUser.isVerifiedByAdmin = true;
                await adminUser.save();
                
                const mailOptions = {
                    from: process.env.GMAIL_USER,
                    to: adminUser.email,
                    subject: "Institute Request accepted by admin",
                    text: `Dear ${adminUser.name}, your request to create the institute ${institute.name} has been accepted by admin`
                }
        
                try {
                    await transporter.sendMail(mailOptions);
                } catch (mailError) {
                    console.error("Failed to send acceptance email:", mailError.message);
                }
            }
        }

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
        const institute = await instituteModel.findById(id).populate("administrator");

        if(!institute){
            return res.status(400).json({success: false, message: "Institute not found"});
        }

        institute.status = "Rejected";
        await institute.save();

        if (institute.administrator) {
            const adminUser = await userModel.findById(institute.administrator._id);
            if (adminUser) {
                adminUser.isVerifiedByAdmin = false;
                await adminUser.save();

                const mailOptions = {
                    from: process.env.GMAIL_USER,
                    to: adminUser.email,
                    subject: "Institute Request rejected by admin",
                    text: `Dear ${adminUser.name}, your request to create the institute ${institute.name} has been rejected by admin`
                }
        
                try {
                    await transporter.sendMail(mailOptions);
                } catch (mailError) {
                    console.error("Failed to send rejection email:", mailError.message);
                }
            }
        }

        res.status(200).json({success: true, message: "Rejected request"});

    } catch (error) {
        console.log("Error in rejectRequest, ", error);
        res.status(500).json({success: false, message: "Internal server Error"});
    }
};
