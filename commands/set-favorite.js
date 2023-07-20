const { SlashCommandBuilder} = require("discord.js");
const searchGame = require("./search").getList;
const utils = require("../utils");

async function replySetFavoriteGame(interaction) {
    const [interactionRes, _interactionValue, gameData] = await searchGame(interaction).catch((e) => {
        utils.log(e, utils.logLevels.error);
    });

    if (!gameData) {
        const e = {message: "Favorite game is undefined!!!"};
        utils.log(e, utils.logLevels.error);
        return false;
    }

    const userData = {
        user_id: interactionRes.user.id,
        username: interactionRes.user.username,
        favorite_game: gameData.name,
        favorite_game_id: gameData.id
    };

    const db = require("../db");
    await db.addUser(userData).then(async (result) => {
        await interactionRes.update({
            content: `Sucessfully added '${gameData.name}' as your favorite game!`, 
            embeds: [],
            components: []
        });
    }).catch(async (e) => {
        await interactionRes.update({
            content: `${e.message}`, 
            embeds: [],
            components: [],
            ephemeral: true
        });
    })
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("set-favorite")
        .setDescription("Set your favorite game")
        .addStringOption(option => option
                         .setName("game")
                         .setDescription("Type the name of the game")
                         .setMinLength(3)
                         .setMaxLength(100)
                         .setRequired(true)),

    async execute(interaction) {
        await replySetFavoriteGame(interaction);
    },
};


