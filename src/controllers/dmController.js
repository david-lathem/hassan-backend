import { sendResponse } from "../utils/sendResponse.js";

export const getDms = async (req, res) => {
  if (req.type === "bot") throw new Error("No DMs with bot, use user bot", 400);

  const dmsCollection = req.client.channels.cache
    .filter((c) => c.type === "DM" || c.type === "GROUP_DM")
    .filter((c) => {
      if (c.type === "GROUP_DM") return true;
      if (!c.recipient.bot) return true;
    });

  const dms = [...dmsCollection.values()].map((d) => ({
    id: d.id,
    type: d.type,
    name: d.name || d.recipient?.globalName || d.recipient?.username, // name only in case of group dm, for deleted username global name is null
    avatar: d.recipient?.avatar, // recipient in case of dm
  }));

  sendResponse(req, res, dms);
};
