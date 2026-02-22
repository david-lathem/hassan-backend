import { FORWARD_CHANNEL_DATA } from "../utils/constants.js";
import { sendResponse } from "../utils/sendResponse.js";

export const sendChannelData = async (req, res) => {
  const channelData = Object.entries(FORWARD_CHANNEL_DATA)
    .filter((d) => !d[1].discord)
    .map((d) => {
      return {
        name: d[1].name,
        alternate: d[1].alternate,
        tc: d[1].tc,
        channelId: d[0],
      };
    });

  sendResponse(req, res, channelData);
};
