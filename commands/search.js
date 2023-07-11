const { SlashCommandBuilder, SlashCommandStringOption, EmbedBuilder, inlineCode, bold } = require("discord.js");

require("dotenv").config();

// Command constants
const twitchClientID = process.env.TWITCH_CLIENT_ID;
const igdbToken = process.env.IGDB_POST_TOKEN;
const game = require("../query");

async function getGameData(queryUserInput) {
    const data = await game.query(queryUserInput, twitchClientID, igdbToken);
    return await data;
}

// Construct Embed message
async function replyGame(interaction) {
    const user = interaction.user;
    const queryUserInput = interaction.options.getString("game");
    const gameData = await game.query(queryUserInput, twitchClientID, igdbToken);

    const helpEmbed = new EmbedBuilder()
          .setColor(0x0099FF)
          .setAuthor({ name: gameData.name, iconURL: "https://cdn.discordapp.com/avatars/1126190008492109864/9cc14e6f7432306ba2195a9c2fef4614.png"})
          .setDescription(gameData.description)
          .addFields(
              {name: "\u200B", value: " " },
              {name: "Rating", value: gameData.rating, inline:true},
              {name: "Release Date", value: gameData.release_date, inline:true},
              {name: "Developers", value: gameData.developers.join(", "), inline:true},
              {name: "\u200B", value:  bold("Platforms: ") + gameData.platforms.join(", ") },
              {name: "\u200B", value: bold("Genres: ") + gameData.genres.join(", ") },
              {name: "\u200B", value:  bold("IGDB Site: ") + gameData.url },
          )
          .setImage("https://images.igdb.com/igdb/image/upload/t_cover_big/" + gameData.picture_id + ".png")
          .setTimestamp()
          .setFooter(
              {
                  text: "Requested by: " + user.username,
                  iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
              });

    interaction.reply({embeds: [helpEmbed]});
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
