const URL = "https://api.igdb.com/v4/games"

function getGame(gameName, twitchClientID, igdbToken) {
    return new Promise((resolve) => {
        const body = `search "${gameName}"; fields name, involved_companies.company.name, cover.image_id, url, rating, genres.*, first_release_date, summary, platforms.*; limit 20;`;
        const response = fetch(URL, {
            method: "POST",
            headers: {
                "Client-ID": twitchClientID,
                "Authorization": `Bearer ${igdbToken}`,
                "Content-Type": "application/json"
            },
            body: body
        }).then((result) => result.json());
        resolve(response);
    })
}

module.exports = {
    async query(gameName, twitchClientID, igdbToken) {
        const foundGames = (await getGame(gameName, twitchClientID, igdbToken));

        let data = foundGames[0];
        for (let i = 0; i < foundGames.length; i++) {
            if (foundGames[i].name.toLowerCase() === gameName) {
                data = foundGames[i];
            }
        }


        const gameNewDate = new Date(data.first_release_date * 1000)
              .toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric"});

        const gameObj = {
            name: data.name,
            url: data.url,
            picture_id: data.cover.image_id,
            release_date: gameNewDate,
            genres: data.genres.map((genre) => {return genre.name}),
            platforms: data.platforms.map((platform) => {return platform.name}),
            rating: parseFloat(data.rating).toFixed(2),
            developers: [...new Set(data.involved_companies.map((item) => {return item.company.name}))],
            description: data.summary
        }
        return gameObj;
    }
}
