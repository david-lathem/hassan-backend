import botClient from "../discord/botClient.js";
import userClient from "../discord/userClient.js";
import Config from "../models/Config.js";
import AppError from "../utils/appError.js";
import { sendResponse } from "../utils/sendResponse.js";

export const getConfig = async (req, res) => {
  const config = await Config.findOne();
  if (!config) throw new AppError("Config not found", 404);

  sendResponse(req, res, config);
};

export const setConfig = async (req, res) => {
  const { token, tokenType } = req.body;

  if (!token || !tokenType)
    throw new AppError("Token and tokenType (bot | user) are required", 400);

  if (!["bot", "user"].includes(tokenType))
    throw new AppError('tokenType must be either "bot" or "user"', 400);

  let err;

  if (tokenType === "bot") err = await botClient.login(token).catch((e) => e);

  if (tokenType === "user") err = await userClient.login(token).catch((e) => e);

  if (err instanceof Error) {
    if (
      err.code === "TOKEN_INVALID" ||
      err.code === "TokenInvalid" ||
      err.code === "INVALID_INTENTS" // happens when normal bot token used on self bot login
    )
      throw new AppError("Invalid token", 400);

    console.error(err);

    // if err other than token invalid
    throw new AppError("Something went wrong", 500);
  }

  const existing = await Config.findOne();

  const config = await Config.findOneAndUpdate(
    {},
    { token, tokenType },
    { new: true, upsert: true, runValidators: true }
  );

  const statusCode = existing ? 200 : 201;

  sendResponse(req, res, config, statusCode);
};
