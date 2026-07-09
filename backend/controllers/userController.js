import userModel from "../models/userModel.js";
import instituteModel from "../models/instituteModel.js";
import cloudinary from "../utils/cloudinary.js";
import classroomModel from "../models/classroomModel.js";
import bcrypt from "bcryptjs";
import { transporter } from "../config/mail.js";
import { emailTemplates } from "../utils/emailTemplates.js";


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
        const { profilePic, bio, name } = req.body;

        const userId = req.user._id;
        const oldUser = await userModel.findById(userId);

        const updateData = {
            name: name,
        };

        if (bio !== undefined) {
            updateData.bio = bio.trim() || "";
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
            if (user.role === "Student") {
                query['students.user'] = user._id;
            } else if (user.role === "Teacher") {
                query.teachers = user._id;
            }
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

export const addStudent = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = req.user;

        if (!user || user.role !== "Administrator") {
            return res.status(403).json({ success: false, message: "Only Administrators can add students" });
        }

        if (!name || !email) {
            return res.status(400).json({ success: false, message: "Name and Email are required" });
        }

        const institute = await instituteModel.findOne({ administrator: user._id, status: "Approved" });
        if (!institute) {
            return res.status(403).json({ success: false, message: "You don't have an approved institute yet" });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User with this email already exists" });
        }

        // Generate a random 8-character password
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        const newStudent = await userModel.create({
            name,
            email,
            password: hashedPassword,
            role: "Student",
            isVerifiedByAdmin: true,
            isAccountVerified: true, // We can assume email is correct since admin added it, or leave false if we want them to verify later.
            institute: institute._id
        });

        // Send Email
        try {
            const loginLink = process.env.FRONTEND_URL || "http://localhost:5173"; // fallback
            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: email,
                subject: emailTemplates.studentAdmission(name, randomPassword, loginLink).subject,
                html: emailTemplates.studentAdmission(name, randomPassword, loginLink).html
            };
            await transporter.sendMail(mailOptions);
        } catch (mailError) {
            console.error("Failed to send admission email:", mailError.message);
            // Don't fail the whole request
        }

        res.json({ success: true, message: "Student added successfully", student: newStudent });

    } catch (error) {
        console.log("Error in addStudent, ", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const assignStudentToClassroom = async (req, res) => {
    try {
        const { targetUserId, classroomId } = req.body;
        const user = req.user;

        if (!user || user.role !== "Administrator") {
            return res.status(403).json({ success: false, message: "Only Administrators can assign students" });
        }

        if (!targetUserId || !classroomId) {
            return res.status(400).json({ success: false, message: "User ID and Classroom ID are required" });
        }

        const institute = await instituteModel.findOne({ administrator: user._id, status: "Approved" });
        if (!institute) {
            return res.status(403).json({ success: false, message: "You don't have an approved institute" });
        }

        const targetUser = await userModel.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        if (String(targetUser.institute) !== String(institute._id)) {
            return res.status(403).json({ success: false, message: "Student does not belong to your institute" });
        }

        const classroom = await classroomModel.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ success: false, message: "Classroom not found" });
        }

        if (String(classroom.institute) !== String(institute._id)) {
            return res.status(403).json({ success: false, message: "Classroom does not belong to your institute" });
        }

        // Check if student is already in the classroom
        const isStudentInClassroom = classroom.students.some(s => String(s.user) === targetUserId);
        if (isStudentInClassroom) {
            return res.status(400).json({ success: false, message: "Student is already in this classroom" });
        }

        classroom.students.push({ user: targetUserId });
        await classroom.save();
        
        targetUser.classrooms.push(classroomId);
        await targetUser.save();

        res.json({ success: true, message: "Student assigned to classroom successfully" });

    } catch (error) {
        console.log("Error in assignStudentToClassroom, ", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getInstituteStudents = async (req, res) => {
    try {
        const user = req.user;

        if (!user || user.role !== "Administrator") {
            return res.status(403).json({ success: false, message: "Only Administrators can view institute students" });
        }

        const institute = await instituteModel.findOne({ administrator: user._id, status: "Approved" });
        if (!institute) {
            return res.status(403).json({ success: false, message: "You don't have an approved institute yet" });
        }

        const students = await userModel.find({ institute: institute._id, role: "Student" }).select("-password");

        res.json({ success: true, students });

    } catch (error) {
        console.log("Error in getInstituteStudents, ", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getClassroomDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const classroom = await classroomModel.findById(id)
            .populate('students.user', '-password')
            .populate('teachers', '-password');

        if (!classroom) {
            return res.status(404).json({ success: false, message: "Classroom not found" });
        }

        let isAuthorized = false;
        
        if (user.role === "Administrator" && String(classroom.createdBy) === String(user._id)) {
            isAuthorized = true;
        } else if (user.role === "Teacher") {
            const isTeacherAssigned = classroom.teachers.some(t => String(t._id) === String(user._id));
            if (isTeacherAssigned) isAuthorized = true;
        } else if (user.role === "Student") {
            const isStudentEnrolled = classroom.students.some(s => String(s.user._id) === String(user._id));
            if (isStudentEnrolled) isAuthorized = true;
        }

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: "You don't have access to this classroom" });
        }

        res.json({ success: true, classroom });

    } catch (error) {
        console.log("Error in getClassroomDetails, ", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const addTeacher = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = req.user;

        if (!user || user.role !== "Administrator") {
            return res.status(403).json({ success: false, message: "Only Administrators can add teachers" });
        }

        if (!name || !email) {
            return res.status(400).json({ success: false, message: "Name and Email are required" });
        }

        const institute = await instituteModel.findOne({ administrator: user._id, status: "Approved" });
        if (!institute) {
            return res.status(403).json({ success: false, message: "You don't have an approved institute yet" });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User with this email already exists" });
        }

        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        const newTeacher = await userModel.create({
            name,
            email,
            password: hashedPassword,
            role: "Teacher",
            isVerifiedByAdmin: true,
            isAccountVerified: true,
            institute: institute._id
        });

        // Verify transporter configuration before sending
        try {
            await transporter.verify();
        } catch (verifyError) {
            console.error("Transporter verification failed:", verifyError.message);
            // If verification fails, rollback teacher creation to keep data consistent
            await userModel.findByIdAndDelete(newTeacher._id);
            return res.status(500).json({ success: false, message: "Email service configuration error. Teacher not created." });
        }

        // Send Email
        const loginLink = process.env.FRONTEND_URL || "http://localhost:5173";
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: emailTemplates.teacherAdmission(name, randomPassword, loginLink).subject,
            html: emailTemplates.teacherAdmission(name, randomPassword, loginLink).html
        };
console.log('Sending teacher admission email', mailOptions);
        try {
            await transporter.sendMail(mailOptions);
        } catch (mailError) {
            console.error("Failed to send teacher admission email:", mailError.message);
            // Rollback teacher creation if email fails
            await userModel.findByIdAndDelete(newTeacher._id);
            return res.status(500).json({ success: false, message: "Failed to send email. Teacher not created." });
        }

        return res.json({ success: true, message: "Teacher added and email sent successfully", teacher: newTeacher });
    } catch (error) {
        console.log("Error in addTeacher, ", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const assignTeacherToClassroom = async (req, res) => {
    try {
        const { targetUserId, classroomId } = req.body;
        const user = req.user;

        if (!user || user.role !== "Administrator") {
            return res.status(403).json({ success: false, message: "Only Administrators can assign teachers" });
        }

        if (!targetUserId || !classroomId) {
            return res.status(400).json({ success: false, message: "User ID and Classroom ID are required" });
        }

        const institute = await instituteModel.findOne({ administrator: user._id, status: "Approved" });
        if (!institute) {
            return res.status(403).json({ success: false, message: "You don't have an approved institute" });
        }

        const targetUser = await userModel.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        if (String(targetUser.institute) !== String(institute._id)) {
            return res.status(403).json({ success: false, message: "Teacher does not belong to your institute" });
        }

        if (targetUser.role !== "Teacher") {
            return res.status(400).json({ success: false, message: "User is not a teacher" });
        }

        const classroom = await classroomModel.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ success: false, message: "Classroom not found" });
        }

        if (String(classroom.institute) !== String(institute._id)) {
            return res.status(403).json({ success: false, message: "Classroom does not belong to your institute" });
        }

        const isTeacherInClassroom = classroom.teachers ? classroom.teachers.some(t => String(t) === targetUserId) : false;
        if (isTeacherInClassroom) {
            return res.status(400).json({ success: false, message: "Teacher is already assigned to this classroom" });
        }

        if (!classroom.teachers) {
            classroom.teachers = [];
        }
        classroom.teachers.push(targetUserId);
        await classroom.save();
        
        targetUser.classrooms.push(classroomId);
        await targetUser.save();

        // Send assignment email
        try {
            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: targetUser.email,
                subject: emailTemplates.teacherAssignment(targetUser.name, classroom.name, classroom.level).subject,
                html: emailTemplates.teacherAssignment(targetUser.name, classroom.name, classroom.level).html
            };
            await transporter.sendMail(mailOptions);
        } catch (mailError) {
            console.error("Failed to send teacher assignment email:", mailError.message);
        }

        res.json({ success: true, message: "Teacher assigned to classroom successfully" });

    } catch (error) {
        console.log("Error in assignTeacherToClassroom, ", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getInstituteTeachers = async (req, res) => {
    try {
        const user = req.user;

        if (!user || user.role !== "Administrator") {
            return res.status(403).json({ success: false, message: "Only Administrators can view institute teachers" });
        }

        const institute = await instituteModel.findOne({ administrator: user._id, status: "Approved" });
        if (!institute) {
            return res.status(403).json({ success: false, message: "You don't have an approved institute yet" });
        }

        const teachers = await userModel.find({ institute: institute._id, role: "Teacher" }).select("-password");

        res.json({ success: true, teachers });

    } catch (error) {
        console.log("Error in getInstituteTeachers, ", error);
        res.status(500).json({ success: false, message: error.message });
    }
}