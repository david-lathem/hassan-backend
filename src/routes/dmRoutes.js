import express from "express";
import { getDms } from "../controllers/dmController.js";

const dmRouter = express.Router();

dmRouter.get("/", getDms);

export default dmRouter;
