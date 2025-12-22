import ClientHandler from "../structures/ClientHandler.js";
import AppError from "../utils/appError.js";
import { startBackup } from "../utils/backup.js";
import { isDmOrGroup, isGuild, throwErrIfBot } from "../utils/checkers.js";
import {
  downloadAndSaveFile,
  getBackupByPath,
  saveBackup,
} from "../utils/file.js";
import { sendResponse } from "../utils/sendResponse.js";

export const sendBackup = async (req, res) => {
  const backupId = req.params.backupId;

  const backupData = await getBackupByPath(backupId);

  if (!backupData) throw new AppError("Backup file not found", 404);

  res.send(backupData);
};

export const backupItem = async (req, res) => {
  const {
    params: { itemId },
    body: { itemType: requestItemType, itemName },
  } = req;

  if (!itemName)
    throw new AppError(
      "Please supply itemName (group, dm, server name) in body",
      400
    );

  if (isGuild(requestItemType)) {
    const guild = ClientHandler.getClient(req).guilds.cache.get(itemId);

    if (!guild) throw new AppError(`${requestItemType} not found`, 404);

    startBackup(req, guild); // no await so it processed in background
  }

  if (isDmOrGroup(requestItemType)) {
    throwErrIfBot(req);

    const dm = ClientHandler.getClient(req).channels.cache.get(itemId);

    if (!dm || !(dm.type === "DM" || dm.type === "GROUP_DM"))
      throw new AppError(`${requestItemType} not found`, 404);

    startBackup(req, dm); // no await so it processed in background
  }

  sendResponse(req, res, undefined);
};

export const backupClientSettings = async (req, res) => {
  const client = ClientHandler.getClient(req);

  const user = await client.users.fetch(client.user.id, { force: true });

  const profile = {
    id: user.id,
    username: user.username,
    globalName: user.globalName,
    avatarURL: user.displayAvatarURL({ dynamic: true }), // returns gif if animated
    presenceActivites: user.presence?.activities,
    bannerColor: user.bannerColor,
    pronouns: user.pronouns,
    bannerURL: user.bannerURL({ dynamic: true }),
    bio: user.bio,
  };

  let avatarExt, bannerExt;

  if (profile.avatarURL)
    avatarExt = await downloadAndSaveFile({
      fileURL: profile.avatarURL,
      id: user.id,
    });

  if (profile.bannerURL)
    bannerExt = await downloadAndSaveFile({
      fileURL: profile.bannerURL,
      id: user.id,
      isBanner: true,
    });

  profile.avatarExt = avatarExt;
  profile.bannerExt = bannerExt;

  await saveBackup("clientSettings", profile);

  sendResponse(req, res, profile);
};

export const backupFriends = async (req, res) => {
  const client = ClientHandler.getClient(req);

  const friends = [...client.relationships.friendCache.values()];

  console.log(friends);
  console.log(friends[0]);

  const friendsBackup = [];

  friends.forEach((friend) => {
    if (!friend) return;

    friendsBackup.push({
      id: friend.id,
      username: friend.username,
      globalName: friend.globalName,
      avatar: friend.displayAvatarURL(),
    });
  });

  await saveBackup("friends", friendsBackup);

  sendResponse(req, res, friendsBackup);
};

export const sendSavedClientSettings = async (req, res) => {
  const settings = await getBackupByPath("clientSettings");

  if (!settings)
    throw new AppError("No setting backup found, backup first", 400);

  res.send(settings);
};
