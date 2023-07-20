const { SlashCommandBuilder} = require("discord.js");

async function replyRemoveFavoriteGame(interaction) {
    const db = require("../db");

    await db.removeUser(interaction.user.id).then(async (result) => {
        await interaction.reply({
            content: `Sucessfully removed your favorite game!`, 
            embeds: [],
            components: []
        });
    }).catch(async (e) => {
        await interaction.reply({
            content: e.message, 
            embeds: [],
            components: []
        });
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove-favorite")
        .setDescription("Remove your favorite game from your profile"),

    async execute(interaction) {
        await replyRemoveFavoriteGame(interaction);
    },
};


