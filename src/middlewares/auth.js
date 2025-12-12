import botClient from "../discord/botClient.js";
import userClient from "../discord/userClient.js";
import Config from "../models/Config.js";
import AppError from "../utils/appError.js";

export const checkLogin = async (req, res, next) => {
  const config = await Config.findOne();

  if (!config) throw new AppError("You have not set a token yet", 400);

  if (config.tokenType === "bot" && !botClient.isReady())
    throw new AppError("Bot not logged in, please re-login", 400);

  if (config.tokenType === "user" && !userClient.isReady())
    throw new AppError("User bot not logged in, please re-login", 400);

  req.type = config.tokenType;

  next();
};
