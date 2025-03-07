import { Client, Collection, GatewayIntentBits, Events, MessageFlags } from "discord.js";
import "dotenv/config"; // to use .env to store sensitive data
import fs from "node:fs"; // to use file system (node builtin)
import path from "node:path"; // to use paths (node builtin)

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
if (!TOKEN || !CLIENT_ID) throw new Error("Missing environment variables");

// Create bot client
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Loading command files
declare module "discord.js" { // Add commands property to Client
  interface Client {
    commands: Collection<string, any>;
  }
}
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        import(filePath).then(command => {
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }).catch(err => console.error(err));
    }
}

// Bot ready event
client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

// Receive interaction /handle command interactions
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`Command ${interaction.commandName} not found`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
    }
  }
});

client.login(TOKEN);
