import mongoose from "mongoose";

const classroomSchema = new mongoose.Schema({
    name: {type: String, required: true},
    level: {type: String, required: true},
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    students: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
            }
        },
    ],
    institute: {type: mongoose.Schema.Types.ObjectId, ref: "institute"},

}, {timestamps: true});

const classroomModel = mongoose.models.classroom || mongoose.model('classroom', classroomSchema);
export default classroomModel;