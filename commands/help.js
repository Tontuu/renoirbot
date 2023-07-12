const { SlashCommandBuilder, inlineCode,} = require("discord.js");
const utils = require("../utils");

// Command constants
const AUTHOR = "Ton";
const TITLE = "Getting started with Renoir?";
const ICON_URL = "https://i.imgur.com/sucFzg8.png";
const DESCRIPTION = "Renoir is a Discord bot application that retrieves most of game metadata from IGDB database.";
const COMMANDS_MSG = `
${inlineCode("/help")}
${inlineCode("/search <game>")}
`;
const DOC_LINK = "https://renoir.com/docs\n";

// Construct Embed message
function replyHelp(interaction) {
    const user = interaction.user;
    const helpEmbed = utils.buildHelpEmbed(0xFF0055, TITLE, AUTHOR, ICON_URL, DESCRIPTION, COMMANDS_MSG, DOC_LINK, user.username);
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
