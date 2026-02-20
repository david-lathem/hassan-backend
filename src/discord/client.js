import { Client, WebhookClient } from "discord.js-selfbot-v13";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

import {
  FORWARD_CHANNEL_DATA,
  FOWARD_CHANNEL_IDS,
  WEB_CHANNEL_IDS,
} from "../utils/constants.js";
import Messages from "../models/messages.js";
import wss from "../websocket/index.js";
import { WebSocket } from "ws";
import { parseTradeMessage } from "../utils/parse.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const client = new Client();

client.on("ready", async () => {
  console.log(`${client.user.username} is ready!`);
});

client.on("messageCreate", async (message) => {
  try {
    if (!WEB_CHANNEL_IDS.includes(message.channelId)) return;

    const { content, embeds, attachments, author, channel } = message;

    // const data = { content, files: [...attachments.values()], embeds };

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
    if (!FOWARD_CHANNEL_IDS.includes(message.channelId)) return;

    const { embeds, attachments, channel } = message;

    const nowEST = dayjs().tz("America/New_York");

    const isAfterSunday9AM =
      nowEST.day() === 0 && // 0 = Sunday
      nowEST.hour() >= 9;

    console.log(message.content);

    let content = message.content || "No content";

    content = content.replace(/<@&\d+>/g, "");

    const configData = FORWARD_CHANNEL_DATA[channel.id];

    if (!isAfterSunday9AM && configData.time) return;

    if (configData.remove_here) content = content.replaceAll("@here", "");

    if (configData.remove_everyone)
      content = content.replaceAll("@everyone", "");

    if (configData.remove_links)
      content = content.replace(/https?:\/\/\S+/gi, "");

    embeds.forEach((e) => {
      if (e.footer?.text) e.footer.text = "";
      if (e.footer?.iconURL) e.footer.iconURL = null;
    });

    if (configData.alternate) {
      const data = { content, files: [...attachments.values()], embeds };

      const webhook = new WebhookClient({
        url: configData.alternate,
      });

      await webhook.send(data);
    }

    if (configData.tc) {
      if (
        embeds[0] &&
        !embeds[0].title?.includes("TC") &&
        !embeds[0].description?.includes("TC")
      ) {
        return;
      }
      embeds.forEach((e) => {
        if (e.title) e.title = e.title.replace(/TC/g, "");
        if (e.description) e.description = e.description.replace(/TC/g, "");
      });
    }

    if (
      configData.excludes?.some((word) =>
        content.toLowerCase().includes(word.toLowerCase()),
      )
    )
      return;

    if (configData.includes?.length) {
      if (
        !configData.includes.some((word) =>
          content.toLowerCase().includes(word.toLowerCase()),
        )
      )
        return;
    }

    const data = {
      content,
      files: configData.remove_files ? [] : [...attachments.values()],
      embeds,
    };

    console.log(content);

    const webhook = new WebhookClient({
      url: configData.WEBHOOK_URL,
    });

    await webhook.send(data);
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
