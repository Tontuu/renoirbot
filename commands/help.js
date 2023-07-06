const { SlashCommandBuilder, EmbedBuilder, inlineCode, bold } = require("discord.js");

// Command constants
const AUTHOR = "Ton";
const TITLE = "Getting started with Renoir?";
const ICON_URL = "https://i.imgur.com/sucFzg8.png";
const DESCRIPTION = "Renoir is a Discord bot application that retrieves most of game metadata from IGDB database.";
const COMMANDS_MSG = `
${inlineCode("/help")}
${inlineCode("/search <game>")}
`;
const FOOTER_TEXT = "Requested by: ";
const DOC_LINK = "https://renoir.com/docs\n";

// Construct Embed message
function replyHelp(interaction) {
    const user = interaction.user;
    const helpEmbed = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle(TITLE)
          .setAuthor({ name: AUTHOR, iconURL: ICON_URL})
          .setDescription(DESCRIPTION)
          .addFields(
              {name: "\u200B", value: " " },
              {name: "Basic commands", value: COMMANDS_MSG},
              {name: "\u200B", value: " " },
              {name: "Documentation", value: DOC_LINK},
              {name: "\u200B", value: " " },
          )
          .setTimestamp()
          .setFooter(
              {
                  text: FOOTER_TEXT + user.username,
                  iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
              });


    interaction.reply({embeds: [helpEmbed]});
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Help command!'),

    async execute(interaction) {
        await replyHelp(interaction);
    },
};
