import { FORWARD_CHANNEL_DATA } from "../utils/constants.js";
import { sendResponse } from "../utils/sendResponse.js";

export const sendChannelData = async (req, res) => {
  const channelData = FORWARD_CHANNEL_DATA.map((d) => {
    return { ...d, WEBHOOK_URL: undefined };
  });

  sendResponse(req, res, channelData);
};
