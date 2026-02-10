import config from "./../../config.json" with { type: "json" };

export const WEB_CHANNEL_IDS = process.env.WEB_CHANNEL_IDS.split(",");
export const FOWARD_CHANNEL_IDS = Object.keys(config);
export const FORWARD_CHANNEL_DATA = config;

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
