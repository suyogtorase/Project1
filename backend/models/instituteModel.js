import mongoose from "mongoose";

const instituteSchema = new mongoose.Schema({
    name: {type: String, required: true},
    location: {type: String},
    administrator: {type: mongoose.Schema.Types.ObjectId, ref: "user", required: true},
    classrooms: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "classroom"
        }
    ],
    status: {type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending"}
}, {timestamps: true});

const instituteModel = mongoose.models.institute || mongoose.model('institute', instituteSchema);
export default instituteModel;
