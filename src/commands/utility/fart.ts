import { SlashCommandBuilder, CommandInteraction } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("fart")
        .setDescription("Replies with Fart!"),  
    async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.reply("https://media.discordapp.net/attachments/473797069400834048/743970313200468038/hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh.gif?ex=67c83198&is=67c6e018&hm=8162b7edf81ab5e48a159b2b0bae33478ed1f98a3839b8e2ef007d9a72d39b2e&=");
    }
}