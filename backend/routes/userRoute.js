import express from "express";
import userAuth from "../middleware/userAuth.js";
import { createClassroom, getClassrooms, getUserData, updateProfile, requestInstitute, assignUserToInstitute, addStudent, assignStudentToClassroom, getInstituteStudents, getClassroomDetails, addTeacher, assignTeacherToClassroom, getInstituteTeachers } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get('/get-data', userAuth, getUserData);
userRouter.put('/update-profile', userAuth, updateProfile);
userRouter.post('/create-classroom', userAuth, createClassroom);
userRouter.get('/get-classrooms', userAuth, getClassrooms);
userRouter.post('/request-institute', userAuth, requestInstitute);
userRouter.post('/assign-user', userAuth, assignUserToInstitute);
userRouter.post('/add-student', userAuth, addStudent);
userRouter.post('/assign-student-classroom', userAuth, assignStudentToClassroom);
userRouter.get('/get-institute-students', userAuth, getInstituteStudents);
userRouter.get('/get-classroom/:id', userAuth, getClassroomDetails);

userRouter.post('/add-teacher', userAuth, addTeacher);
userRouter.post('/assign-teacher-classroom', userAuth, assignTeacherToClassroom);
userRouter.get('/get-institute-teachers', userAuth, getInstituteTeachers);

export default userRouter;