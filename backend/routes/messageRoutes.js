import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getMessages, getUsersForSideBar, markMessagesAsSeen, sendMessage, getAllImages, getClassroomMessages, sendClassroomMessage } from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get('/users', userAuth, getUsersForSideBar);
messageRouter.get('/images/:id', userAuth, getAllImages);

// Classroom Group Chat routes
messageRouter.get('/classroom/:classroomId', userAuth, getClassroomMessages);
messageRouter.post('/classroom/:classroomId', userAuth, sendClassroomMessage);

messageRouter.get('/:id', userAuth, getMessages);
messageRouter.put('/mark/:id', userAuth, markMessagesAsSeen);
messageRouter.post('/send/:id', userAuth, sendMessage);

export default messageRouter;