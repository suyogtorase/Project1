import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    verifyOtp: {type: String, default: ""},
    verifyOtpExpiresAt: {type: Number, default: 0},
    isAccountVerified: {type: Boolean, default: false},
    resetOtp: {type: String, default: ""},
    resetOtpExpiresAt: {type: Number, default: 0},
    role: {type: String, enum: ["Teacher", "Student"], required: true},
    createdAt: {type: Date, default: Date.now()},
    isVerifiedByAdmin: {type: Boolean, default: false},
    profilePic: {type: String, default: ""},
    bio: {type: String}
})

const userModel = mongoose.model.user || mongoose.model('user', userSchema);
export default userModel;