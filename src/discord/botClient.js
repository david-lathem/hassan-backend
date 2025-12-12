import { Client, GatewayDispatchEvents, GatewayIntentBits } from "discord.js";

const botClient = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// when destroyed, it does shard reconnect and then shard ready happens

botClient.type = "bot";

export default botClient;
