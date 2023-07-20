const {EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, inlineCode, bold} = require("discord.js");
const ICON_URL = "https://cdn.discordapp.com/avatars/1126190008492109864/9cc14e6f7432306ba2195a9c2fef4614.png";
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, prettyPrint, errors,  } = format;
const CONSTANTS = require("./constants");
const logLevels = CONSTANTS.LOG.LEVEL;

function log(value, level) {
    let logger = createLogger({
            levels: CONSTANTS.LOG.LEVEL,
            format: combine(
                errors({ stack: true }),
                timestamp(),
                prettyPrint()
            )
    });
    const date = Date.now();
    
    if (level === logLevels.fatal) {
        if (CONSTANTS.STAGE === "DEBUG" || CONSTANTS.STAGE === "RELEASE") {
            if (CONSTANTS.STAGE === "DEBUG") {
                logger.add(new transports.File({ filename: CONSTANTS.LOG.FILES.fatal, level: "fatal" }));
                console.log("[FATAL]: " + value.message + "\n[STACKTRACE]: " + value.stack);
            } else {
                console.error(`[FATAL]: ${value.message} - ${date}`);
                logger = createLogger({
                    format: combine(errors(), timestamp(), format.json()),
                    filename: CONSTANTS.LOG.FILES.fatal,
                    levels: CONSTANTS.LOG.LEVEL });
                logger.add(new transports.File({ filename: CONSTANTS.LOG.FILES.fatal, level: "fatal" }));
            }            
            logger.fatal(value.message, () => process.exit(1));
        } 
        if (CONSTANTS.STAGE === "DEVELOPMENT") {
            console.error(`[FATAL]: ${value.message} - ${date}`);
            process.exit(1);
        }
    }
    if (level === logLevels.error) {
        if (CONSTANTS.STAGE === "DEBUG" || CONSTANTS.STAGE === "RELEASE") {
            logger.add(new transports.File({ filename: CONSTANTS.LOG.FILES.error, level: "error" }));
            if (CONSTANTS.STAGE === "DEBUG") {
                console.log("[ERROR]: " + value.message + " - " + date + "\n[STACKTRACE]: " + value.stack);
            } else {
                logger = createLogger({
                    format: combine(errors(), timestamp(), format.json()),
                    filename: CONSTANTS.LOG.FILES.error,
                    levels: CONSTANTS.LOG.LEVEL });
                logger.add(new transports.File({ filename: CONSTANTS.LOG.FILES.error, level: "error" }));
                console.error(`Something went wrong, check 'errors.log' for more informations! - ${date}`);
            }             
            logger.error(value.message)
        } 
        if (CONSTANTS.STAGE === "DEVELOPMENT") {
            console.error(`[ERROR]: ${value.message} - ${date}`);
        }

    }
    if (level === logLevels.info) {
        if (CONSTANTS.STAGE === "DEBUG") {
            logger.add(new transports.File({ filename: CONSTANTS.LOG.FILES.info, level: "info" }));
            console.log("[INFO]: " + value + " - " + date);
            logger.info(value);
        }
        if (CONSTANTS.STAGE === "DEVELOPMENT") {
            console.log(`[INFO]: ${value} - ${date}`);
        }
    }

    if (level === logLevels.success) {
        if (CONSTANTS.STAGE === "DEBUG") {
            logger.add(new transports.File({ filename: CONSTANTS.LOG.FILES.info, level: "success" }));
            console.log("[SUCCESS]: " + value + " - " + date);
            logger.success(value);
        }
        if (CONSTANTS.STAGE === "DEVELOPMENT") {
            console.log("[SUCCESS]: " + value);
        }
    }

    logger.end();
}

function assignToMissingResults(gameData) {
    if (typeof gameData.url === "undefined") {
        gameData.url = null;
    }

    if (typeof gameData.first_release_date === "undefined") {
        gameData.first_release_date = null;
    }

    if (typeof gameData.cover === "undefined") {
        gameData.cover = { image_id: null };
    }

    if (typeof gameData.rating === "undefined") {
        gameData.rating = null;
    } else {
        gameData.rating = parseFloat(gameData.rating).toFixed(2);
    }

    if (typeof gameData.genres === "undefined") {
        gameData.genres = null;
    } else {
        gameData.genres = gameData.genres.map((genre) => {
            return genre.name;
        });
    }

    if (typeof gameData.platforms === "undefined") {
        gameData.platforms = null;
    } else {
        gameData.platforms = gameData.platforms.map((platform) => {
            return platform.name;
        });
    }

    if (typeof gameData.involved_companies === "undefined") {
        gameData.involved_companies = null;
    } else {
        gameData.involved_companies = [
            ...new Set(
                gameData.involved_companies.map((item) => {
                    return item.company.name;
                }),
            ),
        ];
    }

    if (typeof gameData.playtime === "undefined") {
        gameData.playtime = null;
    } else {
        gameData.playtime =
            `Hastily: ${gameData.playtime.gameplayMain}h\n` +
            `Normally: ${gameData.playtime.gameplayExtra}h\n` +
            `Completely: ${gameData.playtime.gameplayCompletionist}h`;
    }

    return gameData;
}

function buildHelpEmbed(color, title, author, iconURL, description, commandField, source, user) {
    const helpEmbed = new EmbedBuilder()
          .setColor(color)
          .setTitle(title)
          .setAuthor({ name: author, iconURL: iconURL})
          .setDescription(description)
          .addFields(
              {name: "\u200B", value: " " },
              {name: "Basic commands", value: commandField},
              {name: "\u200B", value: " " },
              {name: "Source", value: source},
              {name: "\u200B", value: " " },
          )
          .setTimestamp()
          .setFooter(
              {
                  text: "Requested by: " + user.username,
                  iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
              });

    return helpEmbed;
}

// Construct Embed message
function buildGameEmbed(gameData, color, setTimestamp = false) {
    embedCtx = new EmbedBuilder();

    embedCtx.setAuthor({ name: gameData.name, iconURL: ICON_URL})

    embedCtx.setColor(color);

    if (gameData.description) {
        embedCtx.setDescription(gameData.description)
    }

    embedCtx.addFields({name: "\u200B", value: " "});

    if (gameData.playtime) {
        embedCtx.addFields({name: "Playtime", value: gameData.playtime, inline:true})
    }

    if (gameData.rating) {
        embedCtx.addFields({name: "Rating", value: gameData.rating, inline:true})
    }

    if (gameData.releaseDate) {
        embedCtx.addFields({name: "Release Date", value: gameData.releaseDate, inline:true})
    }

    embedCtx.addFields({name: "\u200B", value: " "});

    if (gameData.developers) {
        embedCtx.addFields({name: " ", value: bold("Developers: ") + gameData.developers.join(", ")});
        if (gameData.platforms || gameData.genres || gameData.url) {
            embedCtx.addFields({name: "\u200B", value: " "});
        }
    }

    if (gameData.platforms) {
        embedCtx.addFields({name: " ", value: bold("Platforms: ") + gameData.platforms.join(", ")});

        if (gameData.genres || gameData.url) {
            embedCtx.addFields({name: "\u200B", value: " "});
        }
    }

    if (gameData.genres) {
        embedCtx.addFields({name: " ", value: bold("Genres: ") + gameData.genres.join(", ")});

        if (gameData.url) {
            embedCtx.addFields({name: "\u200B", value: " "});
        }
    }

    if (gameData.url) {
        embedCtx.addFields({name: " ", value: bold("IGDB Site: ") + gameData.url});
    }

    if (gameData.pictureId) {
        embedCtx.addFields({name: "\u200B", value: " "});
        embedCtx.setImage("https://images.igdb.com/igdb/image/upload/t_cover_big/" + gameData.pictureId + ".png")
    } else {
        embedCtx.addFields({name: "\u200B", value: " " })
    }

    if (setTimestamp) {
        embedCtx.setTimestamp();
    }

    log("Embed sucessfully created!", logLevels.success);

    return embedCtx;
}

function buildListEmbed(gameList, input, color, setTimestamp = true) {
    embedCtx = new EmbedBuilder();

    embedCtx.setAuthor({ name: `Matches for ${input}`, iconURL: ICON_URL})

    embedCtx.setColor(color);

    if (setTimestamp) {
        embedCtx.setTimestamp();
    }

    if (gameList.length == 0) {
        embedCtx.setDescription(`No matches for ${input} >-<`);
        return embedCtx;
    }

    for (let i = 0; i < gameList.length; i++) {
        embedCtx.addFields({name: `${i + 1}. ${gameList[i].name}`, value: ` - ${gameList[i].url}`});
        if (i != gameList.length - 1) {
            embedCtx.addFields({name: "\u200B", value: " " })
        }
    }
    log("Embed sucessfully created!", logLevels.success);
    return embedCtx;
}

function buildStatsEmbed(stats, hardware, interaction, client) {
    const user = interaction.user;
    embedCtx = new EmbedBuilder();

    embedCtx.setAuthor({name: "The best bot around here!"});
    embedCtx.setColor(0x0000FF);
    embedCtx.setTimestamp()
    embedCtx.setThumbnail(ICON_URL);


    let serverCount = client.guilds.cache.size;
    const statsUptime = "- Uptime: " + inlineCode(stats.uptime);
    const statsStatus = "- Status: " + inlineCode(stats.status);
    const statsTimestamp = "- Timestamp: " + inlineCode(stats.timestamp);
    const statsLatency = "- Latency: " + inlineCode(stats.latency);
    statsMsg = `${statsUptime}\n${statsStatus}\n${statsTimestamp}\n${statsLatency}`;

    const hwCpu = "- CPU: " + inlineCode(hardware.cpu);
    const hwOs = "- OS: " + inlineCode(hardware.os);
    const hwHost = "- Host: " + inlineCode(hardware.host);
    const hwMem = "- Memory: " + inlineCode(hardware.mem);
    const hwUptime = "- Uptime: " + inlineCode(hardware.uptime);
    hardwareMsg = `${hwOs}\n${hwCpu}\n${hwMem}\n${hwHost}\n${hwUptime}`;

    embedCtx.addFields(
    {
        name: "📅  Birthday",
        value: "14/07/2023",
        inline: true,
    },
    {
        name: "🏰  Serving",
        value: (serverCount > 1) ? serverCount + " servers" : serverCount + " server",
        inline: true,
    },
    {
        name: "⌨️   Github",
        value: "[RenoirBot](https://github.com/Tontuu/renoirbot)",
        inline: true,
    },
    {
        name: " ",
        value: "\u200B",
    },
    {
        name: "Bot Stats",
        value: statsMsg
    },
    {
        name: "Server Specs",
        value: hardwareMsg
    });

    embedCtx.setFooter({
        text: "Requested by: " + user.username,
        iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    });

    return embedCtx;
}

function buildProfileEmbed(userProfile, gameData, interaction) {
    let user = interaction.user;

    user.username = user.username.charAt(0).toUpperCase() + user.username.slice(1);

    embedCtx = new EmbedBuilder();

    embedCtx.setAuthor({name: user.username});
    embedCtx.setColor(0x0000FF);
    embedCtx.setTimestamp()
    embedCtx.setThumbnail(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`);
    embedCtx.addFields(
    {
        name: " ",
        value: "\u200B",
    },
    {
        name: "Favorite Game",
        value: `[${userProfile.favorite_game}](${gameData.url})`,
    },
    {
        name: " ",
        value: "\u200B",
    },
    );

    embedCtx.setFooter({
        text: "Requested by: " + user.username,
    });

    return embedCtx;
}

function buildMenuOptions(placeholder, gameList) {
    if (!placeholder) {
        throw new Error("Placeholder was not provided");
    }

    const optionMenu = new StringSelectMenuBuilder();

    optionMenu.setCustomId("option-menu");
    optionMenu.setPlaceholder(placeholder);

    for (let i = 0; i < gameList.length; i++) {
        optionMenu.addOptions(new StringSelectMenuOptionBuilder()
                              .setLabel(`${gameList[i].name}`)
                              .setValue(`${i+1}`))
    }

    log("Menu Option sucessfully created!", logLevels.success)
    return optionMenu;
}

function buildButtonsInteraction(buttons) {
    for (let i = 0; i < buttons.length; i++) {
        buttons[i] = new ButtonBuilder()
            .setCustomId(buttons[i].customId)
            .setLabel(buttons[i].label)
            .setStyle(buttons[i].style)
    }

    return buttons;
}

function buildComponent(gameList) {
    const optionsMenu = buildMenuOptions("Select a game", gameList);
    const buttons = buildButtonsInteraction([
        {customId: "previouspage", label: "Prev Page", style: ButtonStyle.Secondary},
        {customId: "cancel", label: "Cancel", style: ButtonStyle.Danger},
        {customId: "nextpage", label: "Next Page", style: ButtonStyle.Secondary},
    ]);

    const buttonsRow = new ActionRowBuilder();
    const menuRow = new ActionRowBuilder();
    buttons.forEach((btn) => {
        buttonsRow.addComponents(btn);
    });
    menuRow.addComponents(optionsMenu);

    return [menuRow, buttonsRow];
}

module.exports = {
    logLevels: CONSTANTS.LOG.LEVEL,
    log(message, level) {
        return log(message, level);
    },
    buildHelpEmbed(color, title, author, iconURL, description, commandField, source, username) {
        return buildHelpEmbed(color, title, author, iconURL, description, commandField, source, username);
    },
    buildGameEmbed(gameData, color, setTimestamp) {
        return buildGameEmbed(gameData, color, setTimestamp);
    },
    buildListEmbed(gameList, input, color, setTimestamp) {
        return buildListEmbed(gameList, input, color, setTimestamp);
    },
    buildStatsEmbed(stats, hardware, interaction, client) {
        return buildStatsEmbed(stats, hardware, interaction, client);
    },
    buildProfileEmbed(userProfile, gameData, interaction) {
        return buildProfileEmbed(userProfile, gameData, interaction);
    },
    buildMenuOptions(placeholder, gameList) {
        return buildMenuOptions(placeholder, gameList);
    },
    buildButtonsInteraction(buttons) {
        return buildButtonsInteraction(buttons);
    },
    buildComponent(gameList) {
        return buildComponent(gameList);
    },
    assignToMissingResults(gameData) {
        return assignToMissingResults(gameData);
    }
}
