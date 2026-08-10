import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    type: { type: String, enum: ["Multiple Choice", "Short Answer"], required: true },
    options: [{ type: String }], // Only for Multiple Choice
    correctAnswer: { type: String, required: true },
    points: { type: Number, required: true, default: 1 }
});

const testSchema = new mongoose.Schema({
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: "classroom", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    title: { type: String, required: true },
    description: { type: String },
    mode: { type: String, enum: ["Online", "Offline"], default: "Online" },
    maxMarks: { type: Number, default: 0 },
    startTime: { type: Date, required: true },
    durationMinutes: { type: Number },
    questions: [questionSchema]
}, { timestamps: true });

const testModel = mongoose.models.test || mongoose.model("test", testSchema);
export default testModel;
