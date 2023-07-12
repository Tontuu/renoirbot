const utils = require("./utils");

const URL = "https://api.igdb.com/v4/games";

function getGame(gameName, twitchClientID, igdbToken) {
    return new Promise((resolve) => {
        const body = `search "${gameName}"; fields name, involved_companies.company.name, cover.image_id, url, rating, genres.*, first_release_date, summary, platforms.*; limit 20;`;
        const response = fetch(URL, {
            method: "POST",
            headers: {
                "Client-ID": twitchClientID,
                Authorization: `Bearer ${igdbToken}`,
                "Content-Type": "application/json",
            },
            body: body,
        })
            .then((result) => result.json())
            .catch((e) => {
                console.error("[ERROR]: ", e);
            });

        resolve(response);
    });
}

async function getGamePlaytime(gameName) {
    let hltb = require("howlongtobeat");
    let hltbService = new hltb.HowLongToBeatService();

    let gamePlaytimes = "None";

    await hltbService.search(gameName).then((result) => {
        gamePlaytimes = {
            gameplayMain: result[0].gameplayMain,
            gameplayExtra: result[0].gameplayMainExtra,
            gameplayCompletionist: result[0].gameplayCompletionist,
        };
    });

    return gamePlaytimes;
}

module.exports = {
    async query(gameName, twitchClientID, igdbToken) {
        const foundGames = await getGame(gameName, twitchClientID, igdbToken);

        if (foundGames.length === 0) {
            return;
        }

        console.log("[INFO]: Found data for `" + gameName + "` game!");

        let data = foundGames[0];

        for (let i = 0; i < foundGames.length; i++) {
            if (foundGames[i].name.toLowerCase() === gameName) {
                data = foundGames[i];
            }
        }

        data.playtime = await getGamePlaytime(gameName);

        data = utils.assignToMissingResults(data);

        const gameNewDate = data.first_release_date
            ? new Date(data.first_release_date * 1000).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
              })
            : data.first_release_date;

        const gameObj = {
            name: data.name,
            url: data.url,
            pictureId: data.cover.image_id,
            releaseDate: gameNewDate,
            genres: data.genres,
            platforms: data.platforms,
            rating: data.rating,
            developers: data.involved_companies,
            playtime: data.playtime,
            description: data.summary,
        };

        return gameObj;
    },
};
