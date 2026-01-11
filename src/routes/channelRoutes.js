import express from "express";
import { sendChannelData } from "../controllers/channelController.js";

const channelRouter = express.Router();

channelRouter.get("/", sendChannelData);

export default channelRouter;
