import express from "express";
import userAuth from "../middleware/userAuth.js";
import { createAnnouncement, getAnnouncements, editAnnouncement, deleteAnnouncement } from "../controllers/announcementController.js";

const announcementRouter = express.Router();

announcementRouter.post("/create", userAuth, createAnnouncement);
announcementRouter.get("/", userAuth, getAnnouncements);
announcementRouter.put("/:id", userAuth, editAnnouncement);
announcementRouter.delete("/:id", userAuth, deleteAnnouncement);

export default announcementRouter;
