import { Client, WebhookClient } from "discord.js-selfbot-v13";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import Twilio from "twilio";
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
const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

client.on("ready", async () => {
  console.log(`${client.user.username} is ready!`);
});

client.on("messageCreate", async (message) => {
  try {
    if (!FOWARD_CHANNEL_IDS.includes(message.channelId)) return;

    const { embeds, attachments, author, channel } = message;
    let content = message.content || "** **";

    const configData = FORWARD_CHANNEL_DATA[channel.id];

    // --------------------- Checks ---------------------
    const nowEST = dayjs().tz("America/New_York");

    const isAfterSunday9AM =
      nowEST.day() === 0 && // Sunday
      nowEST.hour() >= 9 && // After 9:00 AM
      nowEST.hour() <= 23; // Before 11:59 PM

    if (configData.time && !isAfterSunday9AM) return;

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

    // -------------- Manipulation ------------------

    content = content.replace(/<@&\d+>/g, "");

    embeds.forEach((e) => {
      if (e.footer?.text) e.footer.text = "";
      if (e.footer?.iconURL) e.footer.iconURL = null;
      if (e.title) e.title = e.title.replace(/TC/g, "");
      if (e.description) e.description = e.description.replace(/TC/g, "");
    });

    if (configData.remove_here) content = content.replaceAll("@here", "");

    if (configData.remove_everyone)
      content = content.replaceAll("@everyone", "");

    if (configData.remove_links)
      content = content.replace(/https?:\/\/\S+/gi, "");

    if (configData.alternate) {
      const f = await Messages.create({
        channelId: channel.id,
        tc: true,
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
    }

    if (configData.tc)
      if (
        embeds[0] &&
        !embeds[0].title?.includes("TC") &&
        !embeds[0].description?.includes("TC")
      )
        return;

    if (configData.discord) {
      const data = {
        content,
        files: [...attachments.values()],
        embeds,
      };

      const webhook = new WebhookClient({
        url: configData.WEBHOOK_URL,
      });

      return await webhook.send(data);
    }

    const f = await Messages.create({
      channelId: channel.id,
      tc: configData.tc,
      content,
      attachments: configData.remove_files ? [] : [...attachments.values()],
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
    if (message.channel.id === "1474451362975842467") {
      console.log("message in sms channel");

      const numbers = ["+19175170366"];

      for (const number of numbers) {
        try {
          const msg = await client.messages.create({
            body: message.content,
            from: "+18557257809",
            to: number,
          });

          console.log("Sent to:", number, msg.sid);
          console.log(msg);
        } catch (err) {
          console.error(err);
        }
      }
    }
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
