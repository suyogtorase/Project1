import testModel from "../models/testModel.js";
import testSubmissionModel from "../models/testSubmissionModel.js";
import classroomModel from "../models/classroomModel.js";

// Helper function to grade a submission
const gradeSubmission = (test, submission) => {
    let score = 0;
    submission.answers.forEach(subAns => {
        const question = test.questions.find(q => q._id.toString() === subAns.questionId.toString());
        if (question && question.correctAnswer && question.correctAnswer.trim().toLowerCase() === subAns.answer.trim().toLowerCase()) {
            score += question.points || 1;
        }
    });
    return score;
};

export const createTest = async (req, res) => {
    try {
        const { classroomId, title, description, startTime, durationMinutes, questions, mode, maxMarks } = req.body;
        const user = req.user;

        if (!user || user.role !== "Teacher") {
            return res.status(403).json({ success: false, message: "Only Teachers can create tests" });
        }

        const classroom = await classroomModel.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ success: false, message: "Classroom not found" });
        }

        // Verify teacher is assigned to this classroom
        const isTeacherAssigned = classroom.teachers.some(t => t.toString() === user._id.toString());
        if (!isTeacherAssigned) {
            return res.status(403).json({ success: false, message: "You are not assigned to this classroom" });
        }

        const test = await testModel.create({
            classroomId,
            createdBy: user._id,
            title,
            description,
            mode: mode || 'Online',
            maxMarks: mode === 'Offline' ? maxMarks : 0,
            startTime,
            durationMinutes: mode === 'Offline' ? 0 : durationMinutes,
            questions: mode === 'Offline' ? [] : questions
        });

        res.status(201).json({ success: true, test, message: "Test created successfully" });
    } catch (error) {
        console.error("Error in createTest:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getClassroomTests = async (req, res) => {
    try {
        const { classroomId } = req.params;
        const user = req.user;

        const tests = await testModel.find({ classroomId }).sort({ startTime: -1 });

        // If user is a student, we should not send correct answers
        if (user.role === "Student") {
            const submissions = await testSubmissionModel.find({ studentId: user._id });
            const submissionMap = {};
            submissions.forEach(s => {
                submissionMap[s.testId.toString()] = s;
            });

            const sanitizedTests = tests.map(test => {
                const testObj = test.toObject();
                testObj.questions = testObj.questions.map(q => {
                    const { correctAnswer, ...rest } = q;
                    return rest;
                });

                const sub = submissionMap[test._id.toString()];
                if (sub && sub.isSubmitted) {
                    testObj.isSubmitted = true;
                    testObj.score = sub.score;
                } else {
                    testObj.isSubmitted = false;
                }

                return testObj;
            });
            return res.json({ success: true, tests: sanitizedTests });
        }

        res.json({ success: true, tests });
    } catch (error) {
        console.error("Error in getClassroomTests:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllUserTests = async (req, res) => {
    try {
        const user = req.user;
        let query = {};
        
        if (user.role === 'Student') {
            query = { "students.user": user._id };
        } else if (user.role === 'Teacher') {
            query = { teachers: user._id };
        } else if (user.role === 'Administrator') {
            // Admin gets all classrooms
        }

        const classrooms = await classroomModel.find(query).select('_id name');
        const classroomIds = classrooms.map(c => c._id);

        const tests = await testModel.find({ classroomId: { $in: classroomIds } }).sort({ startTime: -1 }).populate('classroomId', 'name');

        if (user.role === "Student") {
            const submissions = await testSubmissionModel.find({ studentId: user._id });
            const submissionMap = {};
            submissions.forEach(s => {
                submissionMap[s.testId.toString()] = s;
            });

            const sanitizedTests = tests.map(test => {
                const testObj = test.toObject();
                testObj.questions = testObj.questions.map(q => {
                    const { correctAnswer, ...rest } = q;
                    return rest;
                });

                const sub = submissionMap[test._id.toString()];
                if (sub && sub.isSubmitted) {
                    testObj.isSubmitted = true;
                    testObj.score = sub.score;
                } else {
                    testObj.isSubmitted = false;
                }

                return testObj;
            });
            return res.json({ success: true, tests: sanitizedTests });
        }

        res.json({ success: true, tests });
    } catch (error) {
        console.error("Error in getAllUserTests:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTestDetails = async (req, res) => {
    try {
        const { testId } = req.params;
        const user = req.user;

        const test = await testModel.findById(testId);
        if (!test) {
            return res.status(404).json({ success: false, message: "Test not found" });
        }

        let testObj = test.toObject();

        if (user.role === "Student") {
            // Find or create a submission record for auto-saving
            let submission = await testSubmissionModel.findOne({ testId, studentId: user._id });

            if (!submission || !submission.isSubmitted) {
                // Strip correct answers
                testObj.questions = testObj.questions.map(q => {
                    const { correctAnswer, ...rest } = q;
                    return rest;
                });
            }

            if (!submission && test.mode !== "Offline") {
                // Check if test has started
                const now = new Date();
                const testStart = new Date(test.startTime);
                if (now < testStart) {
                     return res.status(403).json({ success: false, message: "Test has not started yet" });
                }

                submission = await testSubmissionModel.create({
                    testId,
                    studentId: user._id,
                    answers: []
                });
            }

            return res.json({ success: true, test: testObj, submission });
        }

        res.json({ success: true, test: testObj });
    } catch (error) {
        console.error("Error in getTestDetails:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const saveProgress = async (req, res) => {
    try {
        const { testId } = req.params;
        const { answers } = req.body;
        const user = req.user;

        if (user.role !== "Student") {
            return res.status(403).json({ success: false, message: "Only students can take tests" });
        }

        let submission = await testSubmissionModel.findOne({ testId, studentId: user._id });
        if (!submission) {
             return res.status(404).json({ success: false, message: "Submission record not found. Please refresh." });
        }

        if (submission.isSubmitted) {
             return res.status(400).json({ success: false, message: "Test is already submitted" });
        }

        submission.answers = answers;
        await submission.save();

        res.json({ success: true, message: "Progress saved" });
    } catch (error) {
        console.error("Error in saveProgress:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const submitTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const { answers } = req.body; // Final answers before submit
        const user = req.user;

        if (user.role !== "Student") {
            return res.status(403).json({ success: false, message: "Only students can submit tests" });
        }

        const test = await testModel.findById(testId);
        if (!test) {
            return res.status(404).json({ success: false, message: "Test not found" });
        }

        let submission = await testSubmissionModel.findOne({ testId, studentId: user._id });
        if (!submission) {
             return res.status(404).json({ success: false, message: "Submission record not found" });
        }

        if (submission.isSubmitted) {
            return res.status(400).json({ success: false, message: "Test is already submitted" });
        }

        submission.answers = answers || submission.answers;
        submission.isSubmitted = true;
        submission.submittedAt = new Date();

        // Grade the test
        submission.score = gradeSubmission(test, submission);
        await submission.save();

        res.json({ success: true, message: "Test submitted successfully", score: submission.score });
    } catch (error) {
        console.error("Error in submitTest:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTestResults = async (req, res) => {
    try {
        const { testId } = req.params;
        const user = req.user;

        if (user.role !== "Teacher" && user.role !== "Administrator") {
            return res.status(403).json({ success: false, message: "Unauthorized access" });
        }

        const submissions = await testSubmissionModel.find({ testId, isSubmitted: true }).populate("studentId", "name email rollno");
        
        // Map to return just the scores and student details, not the full test responses per requirements
        const results = submissions.map(sub => ({
            submissionId: sub._id,
            student: sub.studentId,
            score: sub.score,
            submittedAt: sub.submittedAt
        }));

        res.json({ success: true, results });
    } catch (error) {
        console.error("Error in getTestResults:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateAnswer = async (req, res) => {
    try {
        const { testId } = req.params;
        const { questionId, newCorrectAnswer } = req.body;
        const user = req.user;

        if (user.role !== "Teacher") {
             return res.status(403).json({ success: false, message: "Only teachers can update answers" });
        }

        const test = await testModel.findById(testId);
        if (!test) {
            return res.status(404).json({ success: false, message: "Test not found" });
        }

        const question = test.questions.id(questionId);
        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        question.correctAnswer = newCorrectAnswer;
        await test.save();

        // Background re-evaluation
        const submissions = await testSubmissionModel.find({ testId, isSubmitted: true });
        for (let sub of submissions) {
            sub.score = gradeSubmission(test, sub);
            await sub.save();
        }

        res.json({ success: true, message: "Answer updated and all submitted tests have been re-evaluated" });
    } catch (error) {
        console.error("Error in updateAnswer:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const submitOfflineMarks = async (req, res) => {
    try {
        const { testId } = req.params;
        const { marks } = req.body; // Array of { studentId, score }
        const user = req.user;

        if (user.role !== "Teacher") {
            return res.status(403).json({ success: false, message: "Only teachers can submit marks" });
        }

        const test = await testModel.findById(testId);
        if (!test || test.mode !== "Offline") {
            return res.status(404).json({ success: false, message: "Offline test not found" });
        }

        for (const mark of marks) {
            await testSubmissionModel.findOneAndUpdate(
                { testId, studentId: mark.studentId },
                { 
                    isSubmitted: true, 
                    score: mark.score,
                    submittedAt: new Date()
                },
                { upsert: true, new: true }
            );
        }

        res.json({ success: true, message: "Marks saved successfully" });
    } catch (error) {
        console.error("Error in submitOfflineMarks:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
