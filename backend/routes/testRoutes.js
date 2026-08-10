import express from "express";
import { createTest, getClassroomTests, getTestDetails, saveProgress, submitTest, getTestResults, updateAnswer, getAllUserTests, submitOfflineMarks } from "../controllers/testController.js";
import userAuth from "../middleware/userAuth.js";

const testRouter = express.Router();

testRouter.post("/create", userAuth, createTest);
testRouter.get("/all", userAuth, getAllUserTests);
testRouter.get("/classroom/:classroomId", userAuth, getClassroomTests);
testRouter.get("/:testId", userAuth, getTestDetails);
testRouter.post("/:testId/save-progress", userAuth, saveProgress);
testRouter.post("/:testId/submit", userAuth, submitTest);
testRouter.get("/:testId/results", userAuth, getTestResults);
testRouter.put("/:testId/update-answer", userAuth, updateAnswer);
testRouter.post("/:testId/offline-marks", userAuth, submitOfflineMarks);

export default testRouter;
