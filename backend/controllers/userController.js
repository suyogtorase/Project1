import userModel from "../models/userModel.js";
import cloudinary from "../utils/cloudinary.js";

export const getUserData = async(req, res)=> {
    const user = req.user;
    
    try {
        if(!user){
            return res.status(400).json({success: false, message: "User not found"});
        }

        res.status(200).json({
            success: true,
            UserData: {
                name: user.name,
                email: user.email,
                userId: user._id,
                userVerified: user.isAccountVerified,
                role: user.role,
                isVerifiedByAdmin: user.isVerifiedByAdmin,
                profilePic: user.profilePic || "",
                bio: user.bio || "",
            }
        });
        
    } catch (error) {
        console.log("Error in getUserData, ", error);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}

export const updateProfile = async(req, res) => {
    try {
        const { profilePic, bio, name} = req.body;

        const userId = req.user._id
        let updatedUser;

        if(!profilePic) {
            updatedUser = await userModel.findByIdAndUpdate(userId, {bio, name}, {new: true});
        }
        else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await userModel.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, name}, {new: true});
        }

        res.json({success: true, user: updatedUser})
        
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}