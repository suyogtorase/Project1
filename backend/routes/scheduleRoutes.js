import express from "express";
import userAuth from "../middleware/userAuth.js";
import { createSchedule, getSchedules } from "../controllers/scheduleController.js";

const scheduleRouter = express.Router();

scheduleRouter.post('/create', userAuth, createSchedule);
scheduleRouter.get('/', userAuth, getSchedules);

export default scheduleRouter;
