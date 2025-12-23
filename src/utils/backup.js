import {
  downloadAndSaveFile,
  ensureAttachmentsDirectoryExists,
} from "./file.js";

export const backupGuild = async (guild) => {
  const guildBackup = {
    iconURL: guild.iconURL(),
    memberCount: guild.memberCount,
    verificationLevel: guild.verificationLevel,
    defaultMessageNotifications: guild.defaultMessageNotifications,
    explicitContentFilter: guild.explicitContentFilter,
    afkChannelId: guild.afkChannelId,
    afkTimeout: guild.afkTimeout,
    systemChannelId: guild.systemChannelId,
    features: guild.features,
    roles: [],
    categories: [],
    channels: [],
    threads: [],
  };

  if (guildBackup.iconURL)
    await downloadAndSaveFile({ id: guild.id, fileURL: guildBackup.iconURL });

  // Backup roles
  guild.roles.cache.forEach((role) => {
    if (role.managed) return;
    if (role.name === "@everyone") return;
    guildBackup.roles.push({
      id: role.id,
      name: role.name,
      color: role.color,
      permissions: role.permissions.bitfield.toString(),
      hoist: role.hoist,
      position: role.rawPosition,
      mentionable: role.mentionable,
    });
  });

  // Backup categories
  guild.channels.cache
    .filter((channel) => channel.type === "GUILD_CATEGORY")
    .forEach((category) => {
      guildBackup.categories.push({
        id: category.id,
        name: category.name,
        position: category.position,
      });
    });

  // Backup channels
  const channels = guild.channels.cache.filter((channel) =>
    ["GUILD_TEXT", "GUILD_NEWS", "GUILD_FORUM", "GUILD_VOICE"].includes(
      channel.type
    )
  );

  ensureAttachmentsDirectoryExists(guild.id);

  const emojis = await backupEmoji(guild);

  guildBackup.emojis = emojis;

  for (const channel of channels.values()) {
    // Check if the bot has permission to read messages in this channel
    if (
      !channel.permissionsFor(guild.members.me).has("VIEW_CHANNEL")
      // !channel.permissionsFor(guild.members.me).has("READ_MESSAGE_HISTORY")
    ) {
      console.log(
        `Skipping channel due to missing permissions: ${channel.name} (${channel.id})`
      );
      continue;
    }

    // Backup messages and attachments
    const messages = await backupChannel(channel);

    const channelBackup = {
      id: channel.id,
      name: channel.name,
      type: channel.type,
      messages,
      parentId: channel.parentId,
    };

    if (channelBackup.type === "GUILD_PUBLIC_THREAD")
      channelBackup.type = "PUBLIC_THREAD";

    if (channelBackup.type === "GUILD_PRIVATE_THREAD")
      channelBackup.type = "PRIVATE_THREAD";

    guildBackup.channels.push(channelBackup);
  }

  const threads = guild.channels.cache.filter((channel) =>
    ["GUILD_PUBLIC_THREAD", , "GUILD_PRIVATE_THREAD"].includes(channel.type)
  );
  for (const thread of threads.values()) {
    // Backup messages and attachments
    const messages = await backupChannel(thread);

    const threadBackup = {
      id: thread.id,
      name: thread.name,
      type: thread.type,
      messages,
      parentId: thread.parentId,
    };

    if (threadBackup.type === "GUILD_PUBLIC_THREAD")
      threadBackup.type = "PUBLIC_THREAD";

    if (threadBackup.type === "GUILD_PRIVATE_THREAD")
      threadBackup.type = "PRIVATE_THREAD";

    guildBackup.threads.push(threadBackup);
  }

  await guild.fetch(); // this will throw err if token was revoked or something, causing backup to go errored status and not save

  return guildBackup;
};

export const backupDm = async (dm) => {
  // save user recipient avatar locally
  if (dm.type === "DM" && dm.recipient.avatar)
    await downloadAndSaveFile({
      id: dm.recipient.id,
      fileURL: dm.recipient.avatarURL(),
    });

  if (dm.type === "GROUP_DM") {
    for (const recipient of [...dm.recipients.values()]) {
      if (!recipient.avatar) continue;
      await downloadAndSaveFile({
        id: recipient.id,
        fileURL: recipient.avatarURL(),
      });
    }
  }

  const messages = await backupChannel(dm);

  return { messages };
};

async function backupChannel(channel) {
  const messageArray = [];

  if (channel.type === "GUILD_VOICE") return messageArray; // dont grab messages for vc

  if (!channel.messages) {
    console.log(`Channel doesnt have messages ${channel.name} (${channel.id})`);
    return messageArray;
  }

  try {
    let lastMessageId = null;

    while (true) {
      const options = { limit: 100 };

      if (lastMessageId) options.before = lastMessageId;

      const messages = await channel.messages.fetch(options);
      if (messages.size === 0) break;

      console.log(`Fetched 100 messages for ${channel.name} (${channel.id})`);

      for (const message of messages.values()) {
        const messageBackup = {
          content: message.content,
          author: {
            id: message.author.id,
            username: message.author.username,
            avatar: message.author.displayAvatarURL({ format: "webp" }),
          },
          timestamp: message.createdTimestamp,
          attachments: [],
        };

        if (messageBackup.author.avatar)
          await downloadAndSaveFile({
            fileURL: messageBackup.author.avatar,
            id: message.author.id,
          });

        for (const attachment of message.attachments.values()) {
          ensureAttachmentsDirectoryExists(channel.id);

          const fileExtension = await downloadAndSaveFile({
            fileURL: attachment.url,
            itemId: channel.id,
            isAttachment: true,
            id: attachment.id,
          });

          messageBackup.attachments.push({
            id: attachment.id,
            filename: attachment.name,
            url: attachment.url,
            extension: fileExtension,
          });
        }

        messageArray.push(messageBackup);
      }

      lastMessageId = messages.last().id;
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Rate limit delay
    }
  } catch (error) {
    console.error(error);
  }

  return messageArray;
}

async function backupEmoji(guild) {
  const emojis = await guild.emojis.fetch();

  // Transform emoji data to a serializable format
  const emojiData = emojis.map((emoji) => ({
    id: emoji.id,
    name: emoji.name,
    animated: emoji.animated,
    url: emoji.url,
    identifier: emoji.identifier,
    createdTimestamp: emoji.createdTimestamp,
    available: emoji.available,
  }));

  for (const emoji of emojiData) {
    if (!emoji.url) continue;

    const extension = await downloadAndSaveFile({
      id: emoji.id,
      isAttachment: true,
      itemId: guild.id,
      fileURL: emoji.url,
    });

    emoji.extension = extension;
  }

  return emojiData;
}
