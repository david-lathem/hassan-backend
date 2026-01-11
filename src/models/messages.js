import { model, Schema } from "mongoose";

const schema = new Schema(
  {
    channelId: { type: String, required: true },
    content: { type: String },
    author: {
      id: { type: String },
      username: { type: String, required: true },
      avatar: { type: String },
    },

    embeds: { type: [], required: true },

    attachments: { type: [], required: true },
  },
  { timestamps: true }
);

const Messages = model("messages", schema);

export default Messages;
