import { Client } from "discord.js-selfbot-v13";
import { CHANNEL_IDS } from "../utils/constants.js";
import Messages from "../models/messages.js";
import wss from "../websocket/index.js";
import { WebSocket } from "ws";

const client = new Client();

client.on("ready", async () => {
  console.log(`${client.user.username} is ready!`);
});

client.on("messageCreate", async (message) => {
  try {
    if (!CHANNEL_IDS.includes(message.channelId)) return;

    const { content, embeds, attachments, author } = message;
    await Messages.create({
      content,
      attachments: [...attachments.values()],
      embeds,
      author: { avatar: author.displayAvatarURL(), username: author.username, id: author.id },
    });

    wss.clients.forEach(function each(client) {
      if (client.readyState !== WebSocket.OPEN) return;

      client.send(JSON.stringify(message));
    });
  } catch (error) {
    console.error(error);
  }
});

client.login(process.env.TOKEN);
