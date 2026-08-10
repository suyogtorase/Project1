import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    answer: { type: String, default: "" }
}, { _id: false });

const testSubmissionSchema = new mongoose.Schema({
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "test", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    answers: [answerSchema],
    isSubmitted: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date }
}, { timestamps: true });

// Ensure a student can only have one submission document per test
testSubmissionSchema.index({ testId: 1, studentId: 1 }, { unique: true });

const testSubmissionModel = mongoose.models.testSubmission || mongoose.model("testSubmission", testSubmissionSchema);
export default testSubmissionModel;
