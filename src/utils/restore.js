import ClientHandler from "../structures/ClientHandler.js";
import { getAttachment, getAvatar } from "./file.js";

export const restoreGuild = async (req, backupData, guildId) => {
  const client = ClientHandler.getClient(req);
  const guild = client.guilds.cache.get(guildId);

  if (!guild)
    throw new Error("Guild not found. Ensure it is added to the server.");

  await clearServer(guild);

  await guild.setName(backupData.name);

  const iconBuffer = getAvatar(backupData.id);

  if (iconBuffer) await guild.setIcon(iconBuffer);

  for (const roleBackup of backupData.roles) {
    try {
      await guild.roles.create({
        name: roleBackup.name,
        color: roleBackup.color,
        permissions: BigInt(roleBackup.permissions),
        hoist: roleBackup.hoist,
        mentionable: roleBackup.mentionable,
      });
    } catch (error) {
      console.error(error);
    }
  }

  for (const emoji of backupData.emojis) {
    try {
      await guild.emojis.create(
        getAttachment(backupData.id, emoji.id, emoji.extension),
        emoji.name
      );
    } catch (error) {
      console.error(error);
    }
  }

  // Restore categories
  const categoryMap = new Map(); // Map old category IDs to new ones

  for (const categoryBackup of backupData.categories) {
    try {
      const newCategory = await guild.channels.create(categoryBackup.name, {
        type: "GUILD_CATEGORY",
        position: categoryBackup.position,
      });

      categoryMap.set(categoryBackup.id, newCategory.id); // Map old ID to new ID
    } catch (error) {
      console.error(error);
    }
  }

  const channelMap = new Map();

  const promises = backupData.channels.map(async (channelBackup) => {
    try {
      const newChannel = await guild.channels.create(channelBackup.name, {
        type: channelBackup.type,
        parent: categoryMap.get(channelBackup.parentId), // Use mapped category ID
      });

      channelMap.set(channelBackup.id, newChannel.id);

      await restoreMessagesInChannel(newChannel, channelBackup);
    } catch (error) {
      console.error(error);
    }
  });

  await Promise.allSettled(promises);

  const threadPromises = backupData.threads.map(async (threadBackup) => {
    try {
      const parentChannel = guild.channels.cache.get(
        channelMap.get(threadBackup.parentId)
      );

      const createOptions = {
        name: threadBackup.name,
        type: threadBackup.type,
      };

      if (parentChannel.type === "GUILD_FORUM")
        createOptions.message = {
          content: "Initial Message for thread creation!",
        };
      const newThread = await parentChannel.threads.create(createOptions);

      await restoreMessagesInChannel(parentChannel, threadBackup, newThread);
    } catch (error) {
      console.error(error);
    }
  });

  await Promise.allSettled(threadPromises);
  backupData = null;

  console.log(`Restored guild ${guild.name} from backup.`);
};

async function clearServer(guild) {
  // Delete all channels
  for (const channel of guild.channels.cache.values()) {
    try {
      await channel.delete();
    } catch (error) {
      console.error(error);
    }
  }

  // Delete all roles (except @everyone)
  for (const role of guild.roles.cache.values()) {
    if (role.name === "@everyone") continue;
    try {
      await role.delete();
    } catch (error) {
      console.error(error);
    }
  }
}

export const restoreDM = async (req, backupData, channelId) => {
  const channel = ClientHandler.getClient(req).channels.cache.get(channelId);

  if (!channel)
    throw new Error("Channel not found where it should restore into");

  await restoreMessagesInChannel(channel, backupData);

  console.log(`Restored DM backup to channel ${channel.id}`);
};

async function restoreMessagesInChannel(channel, channelBackup, thread) {
  const webhooks = await channel.fetchWebhooks();

  let webhook;

  if (webhooks.size > 0) {
    webhook = webhooks.first();

    // console.log(`Using existing webhook: ${webhook.name}`);
  } else {
    webhook = await channel.createWebhook("Restore Bot");
    // console.log(`Created new webhook: ${webhook.name}`);
  }

  channelBackup.messages.reverse();

  for (const messageBackup of channelBackup.messages) {
    try {
      const files = [];

      for (const att of messageBackup.attachments) {
        const file = getAttachment(channelBackup.id, att.id, att.extension);

        if (file)
          files.push({
            attachment: file, // Use file buffer
            // id: att.id,
            name: att.filename,
          });
        else {
          console.error(`Attachment not found: ${att.filename}`);
        }
      }
      let content = messageBackup.content || ""; // Use a space if content is empty

      if (files.length === 0) {
        await webhook.send({
          content: content || "No content",
          username: messageBackup.author.username, // Set the original username
          avatarURL: messageBackup.author.avatar, // Set the original avatar
          ...(thread && { threadId: thread.id }),
        });
      } else {
        content = `**${messageBackup.author.username}:** ${content}`;
        if (!thread)
          await channel.send({
            content: content || undefined,
            files: files,
          });

        if (thread)
          await channel.send({
            content: content || undefined,
            files: files,
          });
      }
    } catch (error) {
      console.error(error);
    }
  }
}
