const {SlashCommandBuilder, bold} = require("discord.js");
const utils = require("../utils");
const game = require("../query");

require("dotenv").config();

const RANDOM_COLORS = [
    0xbb1155, 0xbb5511, 0x1155bb, 0x11bb55, 0x55bb11, 0x5511bb, 0x44aa00, 0x4400aa, 0xaa0044, 0xaa4400,
    0x0044aa, 0x00aa44,
];
const twitchClientID = process.env.TWITCH_CLIENT_ID;
const igdbToken = process.env.IGDB_POST_TOKEN;
const pageSize = 5;

async function getInteractionResponse(interaction, replyCallback) {

    const collectorFilter = (i) => i.user.id === interaction.user.id;
    return replyCallback.awaitMessageComponent({filter: collectorFilter, time: 60000})
        .then((response) => {
            console.log(`[INFO]: '${interaction.user.username}' replied to interaction menu`);
            return response;
        })
        .catch((e) => {
            console.error("[ERROR]:", e.message);
            return null;
        });
}


async function nextPage(gameName, gameList, pageSize, offset) {
    const lastGameList = gameList;
    gameList = await game.queryList(gameName, twitchClientID, igdbToken, true, pageSize, offset + pageSize);
    if (gameList.length == 0 || gameList.length < pageSize) {
        if (gameList.length == 0) {
            console.log("try agaiN!");
            console.log(
                "[ERROR]: You cannot go to next page, there's no more games to seek because the next is empty",
            );
            gameList = lastGameList;
        } else if (gameList.length < lastGameList.length) {
            console.log("[INFO]: You're in the last page, pay attention!");
            offset += pageSize;
        }
    } else {
        offset += pageSize;
    }

    return {
        list: gameList,
        offset: offset,
    };
}

async function previousPage(gameName, gameList, pageSize, offset) {
    if (offset - pageSize < 0) {
        console.log("try agaiN!");
        console.log("[ERROR-4]: You cannot go to previous page, the offset will be less than 0");
    } else {
        offset -= pageSize;
        gameList = await game.queryList(gameName, twitchClientID, igdbToken, true, pageSize, offset);
    }

    return {
        list: gameList,
        offset: offset,
    };
}

async function getList(interaction) {
    const user = interaction.user;
    const queryUserInput = interaction.options.getString("game");

    console.log(`[INFO]: ${user.username} requested a list for '${queryUserInput}'!`);

    let gameList = await game.queryList(queryUserInput, twitchClientID, igdbToken, true, pageSize);
    let gameData;
    let randomColor = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
    let listEmbed = utils.buildListEmbed(gameList, queryUserInput, randomColor, false);
    let listComponent = utils.buildComponent(gameList);
    let replyCallback;
    let offset = 0;
    let seeking = true;
    let isFirstLoop = true;
    let gameChoice = null;
    let userResponse;
    while (seeking) {
        if (isFirstLoop) {
            replyCallback = await interaction.reply({embeds: [listEmbed], components: listComponent});
            isFirstLoop = false;
        } else {
            replyCallback = await interaction.editReply({embeds: [listEmbed], components: listComponent})
        }
        
        userResponse = await getInteractionResponse(interaction, replyCallback);

        if (!userResponse) {
            await interaction.editReply({
                content: "Exceeded the waiting time limit!",
                embeds: [],
                components: [],
                ephemeral: true })
            break;
        }

        if (userResponse.customId == "cancel") {
            await interaction.deleteReply();

            await userResponse.reply({
                content: `You cancelled the '${bold(queryUserInput)}' search!`,
                embeds: [],
                components: [],
                ephemeral: true })
            seeking = false;
        }

        if (userResponse.customId == "nextpage") {
            result = await nextPage(queryUserInput, gameList, pageSize, offset);
            gameList = result.list;
            offset = result.offset;
            listEmbed = utils.buildListEmbed(gameList, queryUserInput, randomColor, false);
            listComponent = utils.buildComponent(gameList);
            await userResponse.update({embeds: [listEmbed], components: listComponent, ephemeral: true}).catch((e) => {
                console.error("[ERROR]: ", e);
            })
        }

        if (userResponse.customId == "previouspage") {
            result = await previousPage(queryUserInput, gameList, pageSize, offset);
            gameList = result.list;
            offset = result.offset;
            listEmbed = utils.buildListEmbed(gameList, queryUserInput, randomColor, false);
            listComponent = utils.buildComponent(gameList);
            await userResponse.update({embeds: [listEmbed], components: listComponent, ephemeral: true})
        }

        if (userResponse.customId == "option-menu") {
            const choice = userResponse.values[0];
            gameChoice = gameList[choice - 1];
            gameData = await game.fetchGames(gameChoice.id, true, twitchClientID, igdbToken);
            listEmbed = utils.buildGameEmbed(gameData, randomColor, true);
            listEmbed.setFooter({
                text: "Requested by: " + user.username,
                iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
            });

            seeking = false;
        }

    }
    return [userResponse, {embeds: [listEmbed], components:[], ephemeral: false}, null ?? gameData]
}

async function replyList(interaction) {
    [userResponse, value] = await getList(interaction);

    await userResponse.update(value)
        .then(() => console.log(`[SUCCESS]: Bot found and properly replied '${interaction.user.username}' request!`))
        .catch((e) => {
            console.error("[ERROR]:", e);
        });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("search")
        .setDescription("Search for game")
        .addStringOption((option) =>
            option
                .setName("game")
                .setDescription("Type the name of the game")
                .setMinLength(3)
                .setMaxLength(100)
                .setRequired(true),
        ),

    async execute(interaction) {
        await replyList(interaction);
    },

    async getList(interaction) {
        return await getList(interaction)
    }
}
