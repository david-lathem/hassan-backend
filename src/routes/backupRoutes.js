import express from "express";
import { checkItemType, dmOnly } from "../utils/checkers.js";
import {
  backupClientSettings,
  backupItem,
  sendBackup,
  sendSavedClientSettings,
} from "../controllers/backupController.js";

const backupRouter = express.Router();

backupRouter.get("/client-settings", dmOnly, sendSavedClientSettings);
backupRouter.get("/:backupId", sendBackup);

backupRouter.post("/friends", dmOnly, backupClientSettings);
backupRouter.post("/client-settings", dmOnly, backupClientSettings);
backupRouter.post("/:itemId", checkItemType, backupItem);

export default backupRouter;
