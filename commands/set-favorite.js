const { SlashCommandBuilder} = require("discord.js");
const getList = require("./search").getList;
const utils = require("../utils");

async function replySetFavoriteGame(interaction) {
    const resObj = await getList(interaction).catch(async (e) => {
        utils.log(e.message, utils.logLevels.info);
        if (e instanceof CanceledError) {
            await interaction.followUp({
                content: `You canceled the search!`,
                ephemeral: true })
        } else if (e instanceof NotFoundError) {
            await interaction.reply({
                content: `'${interaction.options.getString("game")}' was not found`,
                ephemeral: false })
        } else {
            utils.log(e, utils.logLevels.error);
        }
    });

    if (!resObj) {
        return;
    }

    const userData = {
        user_id: resObj.res.user.id,
        username: resObj.res.user.username,
        favorite_game: resObj.gameData.name,
        favorite_game_id: resObj.gameData.id
    };

    const db = require("../db");
    await db.addUser(userData).then(async (result) => {
        await resObj.res.update({
            content: `Sucessfully added '${resObj.gameData.name}' as your favorite game!`, 
            embeds: [],
            components: []
        });
    }).catch(async (e) => {
        utils.log(e, utils.logLevels.error);
        await resObj.res.update({
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


