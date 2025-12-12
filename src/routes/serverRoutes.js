import express from "express";
import { getServers } from "../controllers/serverController.js";

const serverRouter = express.Router();

serverRouter.get("/", getServers);

export default serverRouter;
