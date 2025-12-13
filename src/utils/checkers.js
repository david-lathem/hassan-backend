import AppError from "./appError.js";
import { botType, botTypeArray } from "./constants.js";

export const isCorrectBotType = (req) => {
  if (!botTypeArray.includes(req.query.tokenType))
    throw new AppError(
      `tokenType (in query params) must be either "${botType.NORMAL_BOT}" or "${botType.SELF_BOT}"`,
      400
    );
};
