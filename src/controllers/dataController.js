import ClientHandler from "../structures/ClientHandler.js";
import AppError from "../utils/appError.js";
import { itemType } from "../utils/constants.js";
import { getAllBackups } from "../utils/file.js";
import { sendResponse } from "../utils/sendResponse.js";

// sends servers, dms, group dms
export const getAllData = async (req, res) => {
  const backups = getAllBackups();

  const guilds = [...ClientHandler.getClient(req).guilds.cache.values()].map(
    (s) => ({
      name: s.name,
      id: s.id,
      iconURL: s.iconURL(),
      isLeft: false,
    })
  );

  const dmCollection = ClientHandler.getClient(req)
    .channels.cache.filter((c) => c.type === "DM")
    .filter((c) => !c.recipient.bot);

  const groupDmCollection = ClientHandler.getClient(req).channels.cache.filter(
    (c) => c.type === "GROUP_DM"
  );

  const dms = [...dmCollection.values()].map((d) => {
    const name = d.recipient.globalName || d.recipient.username;
    const iconURL = d.recipient.avatarURL();

    const data = {
      id: d.id,
      type: d.type,
      name: name,
      iconURL,
    };
    return data;
  });

  const groupDms = [...groupDmCollection.values()].map((d) => {
    const name =
      d.name ||
      [...d.recipients.values()]
        .map((r) => r.globalName || r.username)
        .join(", "); // .name prop exists only in case of group dm, for deleted username global name is null
    const iconURL = d.recipients.first().avatarURL();

    const data = {
      id: d.id,
      type: d.type,
      name: name,
      iconURL,
    };
    return data;
  });

  for (const backup of backups) {
    if (backup.type === "DM") {
      const i = dms.findIndex((d) => d.id === backup.id);

      if (i !== -1) dms[i].backupId = `${itemType.DM}-${backup.id}`;
    }

    if (backup.type === "GROUP_DM") {
      const i = groupDms.findIndex((d) => d.id === backup.id);

      if (i !== -1) groupDms[i].backupId = `${itemType.GROUP_DM}-${backup.id}`;
    }

    if (backup.type === "guild") {
      const i = guilds.findIndex((g) => g.id === backup.id);

      if (i !== -1) guilds[i].backupId = `${itemType.GUILD}-${backup.id}`;
      if (i === -1)
        guilds.push({
          ...backup,
          isLeft: true,
          backupId: `${itemType.GUILD}-${backup.id}`,
        });
    }
  }

  sendResponse(req, res, { guilds, dms, groupDms });
};

export const getGuildChannels = async (req, res) => {
  const guild = ClientHandler.getClient(req).guilds.cache.get(
    req.params.guildId
  );

  if (!guild) throw new AppError("Guild not found", 404);

  const channels = [
    ...guild.channels.cache.filter((c) => c.type === "GUILD_TEXT").values(),
  ];
  sendResponse(req, res, channels);
};
