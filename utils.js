const {EmbedBuilder, bold} = require("discord.js");

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

function buildHelpEmbed(color, title, author, iconURL, description, commandField, documentation, username) {
    const helpEmbed = new EmbedBuilder()
          .setColor(color)
          .setTitle(title)
          .setAuthor({ name: author, iconURL: iconURL})
          .setDescription(description)
          .addFields(
              {name: "\u200B", value: " " },
              {name: "Basic commands", value: commandField},
              {name: "\u200B", value: " " },
              {name: "Documentation", value: documentation},
              {name: "\u200B", value: " " },
          )
          .setTimestamp()
          .setFooter(
              {
                  text: "Requested by: " + username,
                  iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
              });

    return helpEmbed;
}

// Construct Embed message
function buildGameEmbed(gameData, color, setTimestamp = false) {
    embedCtx = new EmbedBuilder();

    embedCtx.setAuthor({ name: gameData.name, iconURL: "https://cdn.discordapp.com/avatars/1126190008492109864/9cc14e6f7432306ba2195a9c2fef4614.png"})

    if (color) {
        const hexColorReg = /^#[0-9A-F]{6}$/i;
        hexColorReg.test(color.toString());
    }

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

    console.log("[INFO]: Embed sucessfully created!");

    return embedCtx;
}

module.exports = {
    buildHelpEmbed(color, title, author, iconURL, description, commandField, documentation, username) {
        return buildHelpEmbed(color, title, author, iconURL, description, commandField, documentation, username);
    },
    buildGameEmbed(gameData, color, setTimestamp) {
        return buildGameEmbed(gameData, color, setTimestamp);
    },
    assignToMissingResults(gameData) {
        return assignToMissingResults(gameData);
    }
}
