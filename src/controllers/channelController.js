import client from "../discord/client.js";
import { WEB_CHANNEL_IDS } from "../utils/constants.js";
import { sendResponse } from "../utils/sendResponse.js";

export const sendChannelData = async (req, res) => {
  const channelData = WEB_CHANNEL_IDS.map((cId) => {
    const ch = client.channels.cache.get(cId);
    return { channelName: ch.name, channelId: ch.id };
  });

  sendResponse(req, res, channelData);
};
