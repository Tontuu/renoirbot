const { SlashCommandBuilder } = require("discord.js");
const utils = require("../utils");

require("dotenv").config();

// Command constants
const MISSING_DATA_MSG = "Meow Meow, Well... I couldn't find any data for this game >.<";
const RANDOM_COLORS = [0xBB1155, 0xBB5511, 0x1155BB, 0x11BB55, 0x55BB11, 0x5511BB,
                       0x44AA00, 0x4400AA, 0xAA0044, 0xAA4400, 0x0044AA, 0x00AA44];
const twitchClientID = process.env.TWITCH_CLIENT_ID;
const igdbToken = process.env.IGDB_POST_TOKEN;
const game = require("../query");

async function replyGame(interaction) {
    const user = interaction.user;
    const queryUserInput = interaction.options.getString("game");

    console.log(`[INFO]: ${user.username} requested '${queryUserInput}'!`)

    const gameData = await game.query(queryUserInput, twitchClientID, igdbToken);

    if (gameData === undefined) {
        console.log(`[ERROR]: Missing data for '${queryUserInput}' game requested by '${user.username}'!`);
        interaction.reply(MISSING_DATA_MSG);
        return;
    }

    const randomColor = RANDOM_COLORS[(Math.floor(Math.random() * RANDOM_COLORS.length))];

    const searchEmbed = utils.buildGameEmbed(gameData, randomColor, setTimestamp = true);

    searchEmbed.setFooter(
        {
            text: "Requested by: " + user.username,
            iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        });

    interaction.reply({embeds: [searchEmbed]})
        .then(() => console.log(`[SUCCESS]: Bot found and properly replied '${queryUserInput}' request!`))
        .catch((e) => {console.error("[ERROR]: ", e);});
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("search")
        .setDescription("Search for a game")
        .addStringOption(option => option
                         .setName("game")
                         .setDescription("Type the name of the game")
                         .setMinLength(3)
                         .setMaxLength(100)
                         .setRequired(true)),

    async execute(interaction) {
        await replyGame(interaction);
    },
};
