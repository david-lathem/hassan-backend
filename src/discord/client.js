import { Client, WebhookClient } from "discord.js-selfbot-v13";
import { CHANNEL_IDS, CHANNEL_IDS_MAP } from "../utils/constants.js";
import Messages from "../models/messages.js";
import wss from "../websocket/index.js";
import { WebSocket } from "ws";
import { parseTradeMessage } from "../utils/parse.js";

const client = new Client();

client.on("ready", async () => {
  console.log(`${client.user.username} is ready!`);
});

client.on("messageCreate", async (message) => {
  try {
    if (!CHANNEL_IDS.includes(message.channelId)) return;

    const { content, embeds, attachments, author, channel } = message;

    const data = { content, files: [...attachments.values()], embeds };

    const webhook = new WebhookClient({ url: CHANNEL_IDS_MAP[channel.id] });

    await webhook.send(data);

    const f = await Messages.create({
      channelId: channel.id,
      content,
      attachments: [...attachments.values()],
      embeds,
      author: {
        avatar: author.displayAvatarURL(),
        username: author.username,
        id: author.id,
      },
    });

    wss.clients.forEach(function each(client) {
      if (client.readyState !== WebSocket.OPEN) return;

      client.send(JSON.stringify(f));
    });
  } catch (error) {
    console.error(error);
  }
});

client.on("messageCreate", async (message) => {
  try {
    const prefix = process.env.COMMAND_PREFIX;

    const { content } = message;

    if (!content.startsWith(prefix)) return;

    const [, command] = content.split(prefix);

    const result = parseTradeMessage(command.trim());

    if (result) await message.reply(result);
  } catch (error) {
    console.error(error);
  }
});

client.login(process.env.TOKEN);

export default client;
