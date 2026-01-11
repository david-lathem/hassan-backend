import express from "express";

const channelRouter = express.Router();

channelRouter.get("/", getAllData);

export default channelRouter;
