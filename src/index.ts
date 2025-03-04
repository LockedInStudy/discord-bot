import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import "dotenv/config";

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
if (!TOKEN || !CLIENT_ID) throw new Error("Missing environment variables");

// Create bot client
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Define slash commands
const commands = [
  {
    name: "ping",
    description: "Replies with Pong!",
  },
];

// Register commands
const rest = new REST({ version: "10" }).setToken(TOKEN);
async function registerCommands() {
  if (CLIENT_ID) {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
  } else {
    throw new Error("CLIENT_ID is not defined");
  }
  console.log("Slash commands registered!");
}

// Bot ready event
client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
  registerCommands();
});

// Handle command interactions
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }
});

client.login(TOKEN);
