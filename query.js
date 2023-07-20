const { assignToMissingResults } = require("./utils");

const URL = "https://api.igdb.com/v4/games";

function getGame(gameName, isID = true, twitchClientID, igdbToken) {
    const game = new Promise((resolve) => {
        let body;
        if (isID) {
            body = `fields name, involved_companies.company.name, cover.image_id,
                    url, rating, genres.*, first_release_date, summary, platforms.*;
                    where id = ${gameName};`;
        } else {
            // Here i'm limiting to a specific pageSize to get a list of results because i can
            // filter the randomized ordered array by the exact name since a
            // list could not be required.
            body = `search "${gameName}"; fields name, involved_companies.company.name,
                    cover.image_id, url, rating, genres.*, first_release_date, summary,
                    platforms.*; limit 10;`;
        }

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
    return game;
}

function getGames(gameName, twitchClientID, igdbToken, getOnlyId = true, pageSize = 5, offset) {
    return new Promise((resolve) => {
        let body;
        if (getOnlyId) {
            if (offset) {
                body = `search "${gameName}"; fields name, url; limit ${pageSize}; offset ${offset};`;
            } else {
                body = `search "${gameName}"; fields name, url; limit ${pageSize};`;
            }
        } else {
            body = `search "${gameName}"; fields name, involved_companies.company.name,
                    cover.image_id, url, rating, genres.*, first_release_date, summary,
                    platforms.*; limit ${pageSize};`;
        }

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

    let gamePlaytimes = undefined;

    await hltbService.search(gameName).then((result) => {
        if (result !== undefined && result.length > 0) {
            gamePlaytimes = {
                gameplayMain: result[0].gameplayMain,
                gameplayExtra: result[0].gameplayMainExtra,
                gameplayCompletionist: result[0].gameplayCompletionist,
            };
        }
    });

    return gamePlaytimes;
}

// Function that fetchGames from api based on ID or name of the game and returns an
// object with relevant metadata
async function fetchGames(gameName, isID,  twitchClientID, igdbToken) {
    const foundGames = await getGame(gameName, isID, twitchClientID, igdbToken);


    if (foundGames.length === 0) {
        return;
    }

    let data = foundGames[0];

    if (isID) {
        console.log(`[INFO]: Found data for "${data.name}" given the "${gameName}" ID!` );
    } else {
        console.log(`[INFO]: Found data for "${data.name}" game!`);
    }

    for (let i = 0; i < foundGames.length; i++) {
        if (foundGames[i].name.toLowerCase() === gameName) {
            data = foundGames[i];
        }
    }


    data.playtime = await getGamePlaytime(data.name);

    data = assignToMissingResults(data);

    const gameNewDate = data.first_release_date
        ? new Date(data.first_release_date * 1000).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : data.first_release_date;

    const gameObj = {
        id: data.id,
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
}

// Function that queries from API and get a list of names + id for the given name
async function queryList(gameName, twitchClientID, igdbToken, getOnlyId, pageSize, offset) {
    const foundGames = await getGames(gameName, twitchClientID, igdbToken, getOnlyId, pageSize, offset);

    return foundGames;
}

module.exports = {
    async fetchGames(gameName, isID, twitchClientID, igdbToken) {
        return await fetchGames(gameName, isID, twitchClientID, igdbToken);
    },
    async queryList(gameName, twitchClientID, igdbToken, getOnlyId, pageSize, offset) {
        return await queryList(gameName, twitchClientID, igdbToken, getOnlyId, pageSize, offset);
    }
}
