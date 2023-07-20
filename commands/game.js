const { SlashCommandBuilder} = require("discord.js");
const utils = require("../utils");


require("dotenv").config();

// Command constants
const twitchClientID = process.env.TWITCH_CLIENT_ID;
const igdbToken = process.env.IGDB_POST_TOKEN;
const game = require("../query");
const RANDOM_COLORS = [
    0xbb1155, 0xbb5511, 0x1155bb, 0x11bb55, 0x55bb11, 0x5511bb, 0x44aa00, 0x4400aa, 0xaa0044, 0xaa4400,
    0x0044aa, 0x00aa44,
];

// Construct Embed message
async function replyGame(interaction) {
    const user = interaction.user;
    const queryUserInput = interaction.options.getString("name");
    const gameData = await game.fetchGames(queryUserInput, isID = false, twitchClientID, igdbToken).catch(async (e) => {
        utils.log(e, utils.logLevels.info);
        await interaction.reply({
            content: `'${queryUserInput}' was not found`,
            ephemeral: false })
    });

    if (!gameData) {
        return;
    }

    const randomColor = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
    const gameEmbed = utils.buildGameEmbed(gameData, randomColor, (setTimestamp = true));
    gameEmbed.setFooter({
        text: "Requested by: " + user.username,
        iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
    });

    interaction.reply({embeds: [gameEmbed]})
        .then(() => utils.log(`Bot found and properly replied '${queryUserInput}' request!`, utils.logLevels.success))
        .catch((e) => utils.log(e, utils.logLevels.error));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("game")
        .setDescription("Get game by it's name")
        .addStringOption(option => option
                         .setName("name")
                         .setDescription("Type the name of the game")
                         .setMinLength(3)
                         .setMaxLength(100)
                         .setRequired(true)),

    async execute(interaction) {
        await replyGame(interaction);
    },
};
