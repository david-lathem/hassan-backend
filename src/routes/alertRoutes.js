import express from "express";
import upload from "../utils/multer";
import { saveAlert } from "../controllers/alertController";

const alertRouter = express.Router();

alertRouter.post("/:channelid", upload.single("alert"), saveAlert);

export default alertRouter;
