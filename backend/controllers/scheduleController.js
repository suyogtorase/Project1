import scheduleModel from "../models/scheduleModel.js";
import classroomModel from "../models/classroomModel.js";
import userModel from "../models/userModel.js";

// Create a new schedule (Admin Only)
export const createSchedule = async (req, res) => {
    try {
        const { classroomId, teacherId, startTime, endTime, subject, mode } = req.body;

        // 1. Verify User is Admin and get Institute
        const adminUser = await userModel.findById(req.user._id);
        if (!adminUser || adminUser.role !== 'Administrator') {
            return res.json({ success: false, message: "Only administrators can create schedules" });
        }

        const instituteId = adminUser.institute;
        if (!instituteId) {
            return res.json({ success: false, message: "Admin is not associated with any institute" });
        }

        // 2. Verify Classroom
        const classroom = await classroomModel.findById(classroomId);
        if (!classroom) {
            return res.json({ success: false, message: "Classroom not found" });
        }
        if (classroom.institute.toString() !== instituteId.toString()) {
            return res.json({ success: false, message: "Classroom does not belong to your institute" });
        }

        // 3. Verify Teacher is allocated to classroom
        const isAllocated = classroom.teachers.includes(teacherId);
        if (!isAllocated) {
            return res.json({ success: false, message: "Selected teacher is not allocated to this classroom" });
        }

        // 4. Create Schedule
        const schedule = new scheduleModel({
            classroom: classroomId,
            teacher: teacherId,
            institute: instituteId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            subject: subject || "",
            mode: mode || "Offline"
        });

        await schedule.save();

        return res.json({
            success: true,
            message: "Schedule created successfully",
            schedule
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get schedules based on user role
export const getSchedules = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const now = new Date();
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);

        let query = {};
        let sortOrder = 1;

        if (user.role === 'Administrator') {
            // Admin gets all schedules for their institute
            query = { institute: user.institute };
            sortOrder = -1; // Reverse order for Admin
        } else if (user.role === 'Teacher') {
            // Teacher gets schedules where they are assigned, ending after now and starting today
            query = {
                teacher: userId,
                endTime: { $gt: now },
                startTime: { $lte: endOfToday }
            };
        } else if (user.role === 'Student') {
            // Student gets schedules for classrooms they are enrolled in, ending after now and starting today
            // First get student's classrooms
            const classrooms = await classroomModel.find({ "students.user": userId });
            const classroomIds = classrooms.map(c => c._id);

            query = {
                classroom: { $in: classroomIds },
                endTime: { $gt: now },
                startTime: { $lte: endOfToday }
            };
        } else {
            return res.json({ success: false, message: "Invalid role" });
        }

        const schedules = await scheduleModel.find(query)
            .populate('classroom', 'name level')
            .populate('teacher', 'name email')
            .sort({ startTime: sortOrder });

        return res.json({
            success: true,
            schedules
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Check if there is an active online class for a classroom right now
export const getActiveOnlineClass = async (req, res) => {
    try {
        const { id: classroomId } = req.params;
        const now = new Date();

        const activeSchedule = await scheduleModel.findOne({
            classroom: classroomId,
            mode: "Online",
            startTime: { $lte: now },
            endTime: { $gte: now }
        });

        if (activeSchedule) {
            return res.json({ success: true, isActive: true, scheduleId: activeSchedule._id });
        } else {
            return res.json({ success: true, isActive: false });
        }
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
