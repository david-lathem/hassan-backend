import { getConfigDb, upsertConfigByTokenType } from "../database/queries.js";
import ClientHandler from "../structures/ClientHandler.js";
import AppError from "../utils/appError.js";
import { isCorrectBotType } from "../utils/checkers.js";
import { botType } from "../utils/constants.js";
import { sendResponse } from "../utils/sendResponse.js";

export const getConfig = async (req, res) => {
  const configs = getConfigDb.all();

  sendResponse(req, res, configs);
};

export const setConfig = async (req, res) => {
  const { token } = req.body;
  const { tokenType } = req.query;

  if (!token || !tokenType)
    throw new AppError(
      `Token (in body) and tokenType (in query param) (${botType.NORMAL_BOT} | ${botType.SELF_BOT}) are required`,
      400
    );

  isCorrectBotType(req);

  let err;

  if (tokenType === botType.NORMAL_BOT) {
    err = await ClientHandler.loginBot(token).catch((e) => e);
  }

  if (tokenType === botType.SELF_BOT) {
    err = await ClientHandler.loginSelf(token).catch((e) => e);
    console.log(err);
  }

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

  const config = upsertConfigByTokenType.run({ token, tokenType });

  sendResponse(req, res, config);
};
