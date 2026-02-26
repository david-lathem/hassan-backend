import express from "express";
import upload from "../utils/multer.js";
import { saveAlert } from "../controllers/alertController.js";

const alertRouter = express.Router();

alertRouter.post("/:channelid", upload.single("alert"), saveAlert);

export default alertRouter;
