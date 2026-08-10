import announcementModel from "../models/announcementModel.js";
import userModel from "../models/userModel.js";

export const createAnnouncement = async (req, res) => {
    try {
        const { title, content } = req.body;
        const user = req.user;

        if (!user || user.role !== "Administrator") {
            return res.status(403).json({ success: false, message: "Only administrators can create announcements" });
        }

        const newAnnouncement = new announcementModel({
            title,
            content,
            instituteId: user.institute,
            createdBy: user._id
        });

        await newAnnouncement.save();
        res.status(201).json({ success: true, message: "Announcement created successfully", announcement: newAnnouncement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAnnouncements = async (req, res) => {
    try {
        const user = req.user;
        if (!user || !user.institute) {
            return res.status(404).json({ success: false, message: "User or institute not found" });
        }

        const announcements = await announcementModel.find({ instituteId: user.institute }).sort({ createdAt: -1 }).populate("createdBy", "name");
        res.status(200).json({ success: true, announcements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const editAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const user = req.user;

        if (!user || user.role !== "Administrator") {
            return res.status(403).json({ success: false, message: "Only administrators can edit announcements" });
        }

        const announcement = await announcementModel.findById(id);
        if (!announcement || announcement.instituteId.toString() !== user.institute.toString()) {
             return res.status(404).json({ success: false, message: "Announcement not found in your institute" });
        }

        announcement.title = title;
        announcement.content = content;
        await announcement.save();

        res.status(200).json({ success: true, message: "Announcement updated successfully", announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!user || user.role !== "Administrator") {
            return res.status(403).json({ success: false, message: "Only administrators can delete announcements" });
        }

        const announcement = await announcementModel.findById(id);
        if (!announcement || announcement.instituteId.toString() !== user.institute.toString()) {
             return res.status(404).json({ success: false, message: "Announcement not found in your institute" });
        }

        await announcementModel.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Announcement deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
