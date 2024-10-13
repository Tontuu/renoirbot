const { SlashCommandBuilder} = require("discord.js");
const os = require("node:os");
const utils = require("../utils");

async function replyStats(interaction, client) {
    let start = new Date();

    const stats = await fetch("http://localhost:2000/stats").then((result) => {
        utils.log(`'${interaction.user.username}' Requested for status`,
                    utils.logLevels.info);

        return result.json();
    });
    stats.latency = new Date() - start + "ms";

    
    const hardware = {
        cpu: "Hamster",
        cores: os.cpus().length,
        os: os.type(),
        host: "O Deus da porra toda",
        mem: "Todos os GBs",
        uptime: (os.uptime() / 3600).toFixed(2) + "h (única informação realmente real)",
    }

    const statsEmbed = utils.buildStatsEmbed(stats, hardware, interaction, client);

    interaction.reply({embeds: [statsEmbed]});
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("Get Renoir status"),

    async execute(interaction, client) {
        await replyStats(interaction, client);
    },

};
