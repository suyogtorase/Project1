import userModel from "../models/userModel.js";
import instituteModel from "../models/instituteModel.js";
import cloudinary from "../utils/cloudinary.js";
import classroomModel from "../models/classroomModel.js";

export const getUserData = async(req, res)=> {
    const user = req.user;
    
    try {
        if(!user){
            return res.status(400).json({success: false, message: "User not found"});
        }

        let instituteName = null;
        if (user.institute) {
            const institute = await instituteModel.findById(user.institute);
            instituteName = institute ? institute.name : "";
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
                rollno: user.rollno,
                instituteName: instituteName || "",
                level: user.level 
            }
        });
        
    } catch (error) {
        console.log("Error in getUserData, ", error);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, name, rollno, level } = req.body;

        const userId = req.user._id;
        const oldUser = await userModel.findById(userId);

        const updateData = {
            name: name,
        };

        if (bio !== undefined) {
            updateData.bio = bio.trim() || "";
        }

        if (rollno !== undefined) {
            updateData.rollno = rollno.trim() || "";
        }

        if (level !== undefined) {
            updateData.level = level.trim() || "";
        }

        if (profilePic) {
            const upload = await cloudinary.uploader.upload(profilePic);
            updateData.profilePic = upload.secure_url;
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );

        res.json({ success: true, user: updatedUser });

    } catch (error) {
        console.log("Error in updateProfile:", error);
        res.json({ success: false, message: error.message });
    }
};

export const requestInstitute = async (req, res) => {
    try {
        const { instituteName, location } = req.body;
        const user = req.user;

        if (!user || user.role !== "Administrator") {
            return res.status(403).json({success: false, message: "Only Administrators can request institutes"});
        }

        if (!instituteName) {
            return res.status(400).json({success: false, message: "Institute name is required"});
        }

        let institute = await instituteModel.findOne({ name: instituteName });
        if (institute) {
            return res.status(400).json({success: false, message: "Institute with this name already exists"});
        }

        institute = await instituteModel.create({
            name: instituteName,
            location: location || "",
            administrator: user._id,
            status: "Pending"
        });
        
        user.institute = institute._id;
        await user.save();

        res.json({success: true, institute, message: "Institute request submitted successfully"});

    } catch (error) {
        console.log("Error in requestInstitute, ", error);
        res.json({success: false, message: error.message});
    }
}

export const createClassroom = async(req, res) => {
    try {
        const { className, level } = req.body; 
        const user = req.user;
        
        if(!user || user.role !== "Administrator") {
            return res.status(403).json({success: false, message: "Only Administrators can create classrooms"})
        }
        
        if(!className || !level) {
            return res.status(400).json({success: false, message: "Enter all credentials"})
        }
        
        const institute = await instituteModel.findOne({administrator: user._id, status: "Approved"});
        if (!institute) {
            return res.status(403).json({success: false, message: "You don't have an approved institute yet"});
        }

        const classroom = await classroomModel.create({
            name: className,
            level: level,
            createdBy: user._id,
            institute: institute._id
        });

        institute.classrooms.push(classroom._id);
        await institute.save();
        
        res.json({success: true, classroom, message: "Classroom created successfully"})
        
    } catch (error) {
        console.log("Error in createClassroom, ", error)
        res.json({success: false, message: error.message});
    }
}

export const assignUserToInstitute = async(req, res) => {
    try {
        const { targetUserId } = req.body;
        const user = req.user;

        if(!user || user.role !== "Administrator") {
            return res.status(403).json({success: false, message: "Only Administrators can assign users"})
        }

        const institute = await instituteModel.findOne({administrator: user._id, status: "Approved"});
        if (!institute) {
            return res.status(403).json({success: false, message: "You don't have an approved institute"});
        }

        const targetUser = await userModel.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({success: false, message: "User not found"});
        }

        targetUser.institute = institute._id;
        await targetUser.save();

        res.json({success: true, message: `User assigned to ${institute.name}`});

    } catch (error) {
        console.log("Error in assignUserToInstitute, ", error);
        res.json({success: false, message: error.message});
    }
}

export const getClassrooms = async(req, res) => {
    try {
        const user = req.user;
        
        if(!user) {
            return res.json({success: false, message: "Login first"})
        }
        
        let query = {};
        if (user.role === "Administrator") {
            query.createdBy = user._id;
        } else if (user.institute) {
            query.institute = user.institute;
        } else {
            return res.json({success: false, classrooms: []});
        }
        
        const classrooms = await classroomModel.find(query);
        
        res.json({success: true, classrooms});
        
    } catch (error) {
        console.log("Error in getClassrooms, ", error)
        res.json({success: false, message: error.message});
    }
}