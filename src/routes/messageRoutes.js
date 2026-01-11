import express from "express";
import { getMessages } from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/", getMessages);

export default messageRouter;
