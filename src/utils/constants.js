import config from "./../../config.json" with { type: "json" };

export const CHANNEL_IDS = Object.keys(config);
export const CHANNEL_IDS_MAP = config;

export const COMMAND_MAP = {
  B: "Bought",
  L: "Bought Lotto",
  BS: "Bought Small",
  S3: "Sold 30%",
  S5: "Sold 50%",
  S7: "Sold 70%",
  SF: "Sold Fully Out",
  S: "Bought SPX",
};
