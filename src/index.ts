import { Client, Collection, GatewayIntentBits, Events, MessageFlags, TextChannel } from "discord.js";
import "dotenv/config"; // to use .env to store sensitive data
import fs from "node:fs"; // to use file system (node builtin)
import path from "node:path"; // to use paths (node builtin)
import { app } from "./server"; // import the webserver defined in server.ts

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
if (!TOKEN || !CLIENT_ID) throw new Error("Missing environment variables");

// Create bot client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
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
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
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
  
  // Log all available guilds
  console.log("Available guilds:");
  client.guilds.cache.forEach(guild => {
    console.log(`- ${guild.name} (ID: ${guild.id})`);
  });
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

// API endpoint to receive messages from the Chrome extension
app.post('/trigger', (req, res) => {
  console.log('Received message', req.body);
  const { message } = req.body;

  // Get the guild and the channel within the guild
  const guild = client.guilds.cache.get('1112885669912658041');
  if (!guild) {
    res.status(500).send('Guild not found');
    console.log('Guild not found');
    return;
  }

  const channel = guild.channels.cache.get('1112885670361452685') as TextChannel;
  if (channel && channel.isTextBased()) {
    channel.send(message);
    res.status(200).send('Message sent');
    console.log('Message sent');
  } 
  else {
    res.status(500).send('Channel not found');
    console.log('Channel not found');
  }
});

client.login(TOKEN);
