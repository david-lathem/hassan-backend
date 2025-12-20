import { botType } from "../utils/constants.js";
import db from "./index.js";

db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    token TEXT NOT NULL,
    tokenType TEXT NOT NULL UNIQUE
      CHECK (tokenType IN ('${botType.SELF_BOT}', '${botType.NORMAL_BOT}'))
  );
`);
