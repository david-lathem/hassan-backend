import { Client } from "discord.js-selfbot-v13";

const userClient = new Client();

userClient.type = "user";

const log =
  (name) =>
  (...data) =>
    console.log(name, ...data);

userClient.on("shardResume", log("shardResume"));
userClient.on("shardReconnecting", log("shardReconnecting"));
userClient.on("shardDisconnect", log("shardDisconnect"));
userClient.on("shardError", log("shardError"));
userClient.on("shardReady", log("shardReady"));

export default userClient;
