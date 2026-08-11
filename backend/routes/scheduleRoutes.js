import express from "express";
import userAuth from "../middleware/userAuth.js";
import { createSchedule, getSchedules, getActiveOnlineClass } from "../controllers/scheduleController.js";

const scheduleRouter = express.Router();

scheduleRouter.post('/create', userAuth, createSchedule);
scheduleRouter.get('/', userAuth, getSchedules);
scheduleRouter.get('/classroom/:id/active', userAuth, getActiveOnlineClass);

export default scheduleRouter;
