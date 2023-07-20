
const { SlashCommandBuilder} = require("discord.js");
const utils = require("../utils");
const game = require("../query");

require("dotenv").config()
const twitchClientID = process.env.TWITCH_CLIENT_ID;
const igdbToken = process.env.IGDB_POST_TOKEN;

async function replyProfile(interaction) {
    let user = interaction.options.getUser('user');
    if (!user) {
        user = interaction.user.id;
    }

    const db = require("../db");
    await db.getUser(user).then(async (userProfile) => {
        const gameData = await game.fetchGames(userProfile.favorite_game_id, isID = true, twitchClientID, igdbToken);
        const profileEmbed = utils.buildProfileEmbed(userProfile, gameData, interaction)
        await interaction.reply({
            embeds: [profileEmbed],
            components: []
        });
    }).catch(async (e) => {
        await interaction.reply({
            content: `Oops... ${e.message}`, 
            embeds: [],
            components: [],
            ephemeral: true
        });
    })
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("View your RENOIRED profile")
        .addUserOption(option => option
                         .setName("user")
                         .setDescription("Type the user name or ID")
                         .setRequired(false)),

    async execute(interaction) {
        await replyProfile(interaction);
    },
};


