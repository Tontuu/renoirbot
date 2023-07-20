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
        cpu: os.cpus()[0].model,
        cores: os.cpus().length,
        os: os.type(),
        host: os.hostname(),
        mem: (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2) + "Gb",
        uptime: (os.uptime() / 3600).toFixed(2) + "h",
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
