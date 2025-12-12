import { sendResponse } from "../utils/sendResponse.js";

export const getServers = async (req, res) => {
  let servers = [];

  servers = [...req.client.guilds.cache.values()].map((s) => ({
    name: s.name,
    id: s.id,
    iconURL: s.iconURL(),
  }));

  sendResponse(req, res, servers);
};
