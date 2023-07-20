const {SlashCommandBuilder, bold} = require("discord.js");
const { CanceledError, NotFoundError } = require("../errors");
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
            utils.log(
                `'${interaction.user.username}' replied to interaction menu`,
                 utils.logLevels.success)
            return response;
        })
        .catch((e) => {
            utils.log(e, utils.logLevels.error);
            return null;
        });
}


async function nextPage(gameName, gameList, pageSize, offset) {
    const lastGameList = gameList;
    gameList = await game.queryList(gameName, twitchClientID, igdbToken, true, pageSize, offset + pageSize);
    if (gameList.length == 0 || gameList.length < pageSize) {
        if (gameList.length == 0) {
            const e = {message: "You cannot go to next page, there's no more games to seek because the next is empty"};
            utils.log(e, utils.logLevels.error);
            gameList = lastGameList;
        } else if (gameList.length < lastGameList.length) {
            utils.log("You're in the last page, pay attention!", utils.logLevels.info);
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
        const e = {message: "You cannot go to previous page, the offset will be less than 0"};
        utils.log(e, utils.logLevels.error);
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

    utils.log(`${user.username} requested a list for '${queryUserInput}'!`,
         utils.logLevels.info);

    let gameList = await game.queryList(queryUserInput, twitchClientID, igdbToken, true, pageSize);
    if (gameList.length == 0) {
        throw new NotFoundError(`${queryUserInput} requested by ${user.username} was not found`);
    }

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
            throw new Error(`'${user.username}' canceled the interaction`);
        }

        if (userResponse.customId == "nextpage") {
            result = await nextPage(queryUserInput, gameList, pageSize, offset);
            gameList = result.list;
            offset = result.offset;
            listEmbed = utils.buildListEmbed(gameList, queryUserInput, randomColor, false);
            listComponent = utils.buildComponent(gameList);
            await userResponse.update({embeds: [listEmbed], components: listComponent, ephemeral: true}).catch((e) => {
                utils.log(e, utils.logLevels.error);
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
    return {
        res: userResponse,
        value: {embeds: [listEmbed], components:[], ephemeral: false},
        gameData: null ?? gameData
    }
}

async function replyList(interaction) {
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

    if (resObj) {
        await userResponse.update(value)
            .then(() => utils.log(`Bot found and properly replied '${interaction.user.username}' request!`, utils.logLevels.success))
            .catch((e) => {
                utils.log(e, utils.logLevels.error);
            });
    }
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
        return await replyList(interaction);
    },

    async getList(interaction) {
        return await getList(interaction)
    }
}
