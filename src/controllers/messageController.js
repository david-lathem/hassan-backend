import Messages from "../models/messages.js";
import { sendResponse } from "../utils/sendResponse.js";

export const getMessages = async (req, res) => {
  const limit = Number(req.query.limit ?? 2);

  const filterQuery = { channelId: req.params.channelId };

  if (req.query.next) {
    filterQuery._id = { $lt: req.query.next };
  }

  const messages = await Messages.find(filterQuery)
    .sort({
      _id: "descending",
    })
    .limit(limit);

  const next = messages[messages.length - 1]?._id ?? null;

  sendResponse(req, res, { messages, next });
};
