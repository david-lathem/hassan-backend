import db from "./index.js";

export const getConfigDb = db.prepare(`
  SELECT *
  FROM config
`);

export const upsertConfigByTokenType = db.prepare(`
  INSERT INTO config (token, tokenType)
  VALUES (@token, @tokenType)
  ON CONFLICT(tokenType) DO UPDATE SET
    token = excluded.token
  RETURNING token, tokenType
`);
