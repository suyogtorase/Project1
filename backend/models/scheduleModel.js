import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "classroom",
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "institute",
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    subject: {
        type: String,
        default: ""
    },
    mode: {
        type: String,
        enum: ["Offline", "Online"],
        default: "Offline"
    }
}, {timestamps: true});

const scheduleModel = mongoose.models.schedule || mongoose.model("schedule", scheduleSchema);

export default scheduleModel;
