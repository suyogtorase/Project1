import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: "institute", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    createdAt: { type: Date, default: Date.now }
});

const announcementModel = mongoose.models.announcement || mongoose.model("announcement", announcementSchema);
export default announcementModel;
