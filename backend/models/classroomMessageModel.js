import mongoose from "mongoose";

const classroomMessageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: "classroom", required: true },
    text: { type: String, default: "" },
    fileUrl: { type: String },
    fileType: { type: String },
    fileName: { type: String },
}, { timestamps: true });

const classroomMessageModel = mongoose.models.classroomMessage || mongoose.model('classroomMessage', classroomMessageSchema);
export default classroomMessageModel;
