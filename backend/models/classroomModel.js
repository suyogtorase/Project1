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
            },
            rollno: {
                type: Number,
            }
        },
    ],
    institute: {type: mongoose.Schema.Types.ObjectId, ref: "institute"},

}, {timestamps: true});

classroomSchema.pre('save', function (next) {
    if (this.isModified('students')) {
        let maxRollNo = 0;
        this.students.forEach(student => {
            if (student.rollno && student.rollno > maxRollNo) {
                maxRollNo = student.rollno;
            }
        });
        
        this.students.forEach(student => {
            if (!student.rollno) {
                maxRollNo += 1;
                student.rollno = maxRollNo;
            }
        });
    }
    next();
});

const classroomModel = mongoose.models.classroom || mongoose.model('classroom', classroomSchema);
export default classroomModel;