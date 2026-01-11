import { model, Schema } from "mongoose";

const schema = new Schema(
  {
    content: { type: String, required: true },
    author: {
      username: { type: String, required: true },
      avatar: { type: String },
    },

    // embeds: [
    //   {
    //     title: { type: String },
    //     description: { type: String },
    //     url: { type: String },
    //     color: { type: Number },
    //     fields: [
    //       {
    //         name: { type: String },
    //         value: { type: String },
    //         inline: { type: Boolean, default: false },
    //       },
    //     ],
    //     footer: {
    //       text: { type: String },
    //       icon_url: { type: String },
    //     },
    //     image: { url: String },
    //     thumbnail: { url: String },
    //     timestamp: { type: Date },
    //   },
    // ],

    // attachments: [
    //   {
    //     id: { type: String },
    //     filename: { type: String },
    //     size: { type: Number },
    //     url: { type: String },
    //     proxy_url: { type: String },
    //     content_type: { type: String },
    //   },
    // ],
  },
  { timestamps: true }
);

const Messages = model("messages", schema);

export default Messages;
