import { FORWARD_CHANNEL_DATA } from "../utils/constants.js";
import { sendResponse } from "../utils/sendResponse.js";

export const sendChannelData = async (req, res) => {
  const channelData = Object.values(FORWARD_CHANNEL_DATA)
    .filter((d) => !d.discord)
    .map((d) => {
      return { ...d, WEBHOOK_URL: undefined };
    });

  sendResponse(req, res, channelData);
};
