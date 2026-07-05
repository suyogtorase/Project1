import express from "express";
import userAuth from "../middleware/userAuth.js";
import { createClassroom, getClassrooms, getUserData, updateProfile, requestInstitute, assignUserToInstitute, addStudent, assignStudentToClassroom } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get('/get-data', userAuth, getUserData);
userRouter.put('/update-profile', userAuth, updateProfile);
userRouter.post('/create-classroom', userAuth, createClassroom);
userRouter.post('/get-classrooms', userAuth, getClassrooms);
userRouter.post('/request-institute', userAuth, requestInstitute);
userRouter.post('/assign-user', userAuth, assignUserToInstitute);
userRouter.post('/add-student', userAuth, addStudent);
userRouter.post('/assign-student-classroom', userAuth, assignStudentToClassroom);

export default userRouter;