const { SlashCommandBuilder, inlineCode, bold} = require("discord.js");
const utils = require("../utils");

// Command constants
const AUTHOR = "Ton";
const TITLE = "Getting started with Renoir?";
const ICON_URL = "https://i.imgur.com/sucFzg8.png";
const DESCRIPTION = "Renoir is a Discord bot application that retrieves most of game metadata from IGDB database.";
const COMMANDS_MSG = `
-
${bold("CORE")}
${inlineCode("/game <name>")} - Search for game by exact name
${inlineCode("/search <name>")} - Search for a list of games with similar names

${inlineCode("-------------------------")}

${bold("PROFILE")}
${inlineCode("/profile <user>")} - Get user profile
${inlineCode("/set-favorite <game>")} - Set your favorite game
${inlineCode("/remove-favorite <game>")} - Remove your favorite game

${inlineCode("-------------------------")}

${bold("MISC")}
${inlineCode("/help")} - Show this message
${inlineCode("/stats")} - Get Renoir status

`;
const LINK = "https://github.com/Tontuu/renoirbot\n";

// Construct Embed message
function replyHelp(interaction) {
    const user = interaction.user;
    const helpEmbed = utils.buildHelpEmbed(0xDD1155, TITLE, AUTHOR, ICON_URL, DESCRIPTION, COMMANDS_MSG, LINK, user);
    interaction.reply({embeds: [helpEmbed]});
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Help command!'),

    execute(interaction) {
        replyHelp(interaction);
    },
};
