const { SlashCommandBuilder } = require("discord.js");
const utils = require("../utils");

require("dotenv").config();

// Command constants
const MISSING_DATA_MSG = "Meow Meow, Well... I couldn't find any data for this game >.<";
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

    const searchEmbed = utils.buildGameEmbed(gameData, 0x0099FF, setTimestamp = true);

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
