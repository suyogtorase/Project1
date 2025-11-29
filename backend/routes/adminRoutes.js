import express from "express";
import { getAllPendingRequest, acceptRequest, rejectRequest, getAdminData } from "../controllers/adminController.js";
import adminAuth from "../middleware/adminAuth.js";

const adminRouter = express.Router();

adminRouter.get('/get-admin-data', adminAuth, getAdminData)
adminRouter.get('/get-requests', adminAuth, getAllPendingRequest);
adminRouter.patch('/accept-request/:id', adminAuth, acceptRequest);
adminRouter.patch('/reject-request/:id', adminAuth, rejectRequest);

export default adminRouter;