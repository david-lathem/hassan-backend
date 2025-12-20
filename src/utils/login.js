import { getConfigDb } from "../database/queries.js";
import ClientHandler from "../structures/ClientHandler.js";
import { botType } from "./constants.js";

export const loginBotsOnStartup = async () => {
  try {
    const configs = getConfigDb.all();

    const normalBotconfig = configs.find(
      (c) => c.tokenType === botType.NORMAL_BOT
    );

    const userBotconfig = configs.find((c) => c.tokenType === botType.SELF_BOT);

    if (normalBotconfig) await ClientHandler.loginBot(normalBotconfig.token);

    if (userBotconfig) await ClientHandler.loginSelf(userBotconfig.token);
  } catch (error) {
    console.log("Error logging in the tokens!");

    console.error(error);
  }
};
