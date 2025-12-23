import express from "express";
import { getAllData, getGuildChannels } from "../controllers/dataController.js";

const dataRouter = express.Router();

dataRouter.get("/", getAllData);
dataRouter.get("/:guildId", getGuildChannels);

export default dataRouter;
