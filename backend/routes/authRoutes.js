import express from "express";
import { adminLogin, adminRegister, googleLogin, isAuthenticated, logout, resetPassword, sendResetOtp, sendVerifyOtp, userLogin, userRegister, verifyEmail } from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";

const authRouter = express.Router();

authRouter.post('/register', userRegister);
authRouter.post('/login', userLogin);
authRouter.post('/logout', logout);
authRouter.get('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.get('/is-auth', userAuth, isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/google', googleLogin);
authRouter.post('/admin-register', adminRegister);
authRouter.post('/admin-login', adminLogin);
authRouter.get('/admin-auth', adminAuth, isAuthenticated);

export default authRouter;