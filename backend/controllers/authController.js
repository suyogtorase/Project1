import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import userModel from "../models/userModel.js"
import { transporter } from "../config/mail.js";
import { emailTemplates } from "../utils/emailTemplates.js";

// user register functionality
export const userRegister = async (req, res) => {
    const {name, email, password} = req.body;

    if(!name || !email || !password){
        return res.status(400).json({success: false, message: 'All fields are required'});
    }

    try {
        const existingUser = await userModel.findOne({email});
        
        if(existingUser){
            return res.status(400).json({success: false, message: "User already exists"});
        }

        const hashedpassword = await bcrypt.hash(password, 10);

        const user = new userModel({name, email, password: hashedpassword});
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '2d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'lax',
            maxAge: 2 * 24 * 60 * 60 * 1000
        })
        
        // sending welcome email
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: emailTemplates.welcome(name).subject,
            html: emailTemplates.welcome(name).html
        }

        await transporter.sendMail(mailOptions);

        res.status(200).json({success: true, message: "User Registered successfully"});
        
    } catch (error) {
        console.log("Error in user register, ", error);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}

// user login functionality
export const userLogin = async (req, res)=> {
    const {email, password} = req.body;
    
    if(!email || !password){
        return res.status(400).json({success: false, message: 'Email and password are required'});
    }
    
    try {
        const user = await userModel.findOne({email});
        
        if(!user){
            return res.status(400).json({success: false, message: "Invalid Email"});
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        
        if(!isMatch){
            return res.status(400).json({success: false, message: "Invalid credencials"});
        }
        
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '2d'});
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'strict',
            maxAge: 2 * 24 * 60 * 60 * 1000
        });


        res.status(200).json({success: true, message: "User logged in successfully"});
        
    } catch (error) {
        console.log("Error in user login, ", error);
        res.status(500).json({success: false, message: "Internal server error"});
    }
};

// logout functionality
export const logout = async (req, res)=> {
    try{
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'strict',
        })
        
        res.status(200).json({success: true, message: "user Logout successfully"});
        
    }catch(error){
        console.log("Error in user logout, ", error);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}

// send the OTP to verify user
export const sendVerifyOtp = async (req, res) => {
  try {
    const user = req.user;

    if(!user){
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res.status(400).json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    console.log("Generated OTP:", otp);

    user.verifyOtp = otp;
    user.verifyOtpExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // valid for 24 hours
    await user.save();

    // send email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: emailTemplates.verifyOtp(otp).subject,
      html: emailTemplates.verifyOtp(otp).html,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "OTP sent successfully to email" });
  } catch (error) {
    console.error("Error in sendVerifyOtp:", error);
    res.status(500).json({ success: false, message: "Internal server error", error });
  }
};

// check the otp to verify email
export const verifyEmail = async (req, res)=> {
    const user = req.user;
    const { otp } = req.body;

    if(!user || !otp){
        return res.status(400).json({success: false, message: 'Missing Details'});
    }

    try {

        if(user.verifyOtp === "" || user.verifyOtp !== otp){
            return res.status(400).json({success: false, message: 'Invalid OTP'});
        }

        if(user.verifyOtpExpiresAt < Date.now()){
            return res.status(400).json({success: false, message: 'OTP expired'});
        }

        user.isAccountVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpiresAt = 0;

        await user.save();

        return res.status(200).json({success: true, message: 'OTP verified'});

    } catch (error) {
        console.log("Error in verifyEmail ", error);
        res.status(500).json({success: false, message: "Internal server error"});
    }
};

// to check whether user is verified or not
export const isAuthenticated = async(req, res)=> {
    try {
        return res.status(200).json({success: true, message: 'User is Authenticated'});
    } catch (error) {
        console.log("Error in isAuthenticated ", error);
        res.status(500).json({success: false, message: "Internal server error"});
    }
};

// send the otp to reset user password
export const sendResetOtp = async(req, res)=> {
    const { email } = req.body;
    
    if(!email){
        return res.status(400).json({success: false, message: "Email is required"});
    }

    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.status(404).json({success: false, message: "User not found"});
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        console.log("Generated OTP:", otp);

        user.resetOtp = otp;
        user.resetOtpExpiresAt = Date.now() + 15 * 60 * 1000; // valid for 15 minutes
        await user.save();

        // send email
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: user.email,
            subject: emailTemplates.resetPasswordOtp(otp).subject,
            html: emailTemplates.resetPasswordOtp(otp).html,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: "OTP sent successfully to email" });

    } catch (error) {
        console.log("Error in sendResetOtp ", error);
        res.status(500).json({success: false, message: "Internal server error"});
    }
};

// reset user password
export const resetPassword = async(req, res)=> {
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.status(400).json({success: false, message: "All fields are required"});
    }

    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.status(400).json({success: false, message: "User not found"});
        }

        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.status(400).json({success: false, message: "Invalid OTP"});
        }

        if(user.resetOtpExpiresAt < Date.now()){
            return res.status(400).json({success: false, message: "OTP expired"});
        }

        const hashedpassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedpassword;
        user.resetOtp = "";
        user.resetOtpExpiresAt = 0;

        await user.save();

        return res.status(200).json({success: true, message: "Password has been reset successfully"});

    } catch (error) {
        console.log("Error in sendResetOtp ", error);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}