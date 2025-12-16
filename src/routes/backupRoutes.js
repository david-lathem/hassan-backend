import express from "express";
import { checkItemType } from "../utils/checkers.js";
import { backupItem, sendBackup } from "../controllers/backupController.js";

const backupRouter = express.Router();

backupRouter.get("/:backupId", sendBackup);
backupRouter.post("/:itemId", checkItemType, backupItem);

export default backupRouter;
