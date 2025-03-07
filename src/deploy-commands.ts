import { REST, Routes } from 'discord.js';
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

const commands = [];
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
if (!TOKEN || !CLIENT_ID) throw new Error("Missing environment variables");

// Get all command folders
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath); // Read all content in the commands directory

for (const folder of commandFolders) {
    // Get all command files from commandFolders
    const commandPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));

    // Get all SlashCommandBuilder#toJSON() output from each command (so it can be deployed)
    for (const file of commandFiles) {
        const filePath = path.join(commandPath, file);
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Instantiate instance of REST module 
const rest = new REST().setToken(TOKEN);

// Deploy commands
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
        const data: any = await rest.put(
			Routes.applicationCommands(CLIENT_ID),
			{ body: commands },
		);

        for (let i: number = 0; i < data.length; i++) {
            console.log(`Command ${data[i].name} has been deployed.`);
        }

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();