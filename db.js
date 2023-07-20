const { Client } = require("pg");
const utils = require("./utils");

async function connectToDatabase() {
    require("dotenv").config();
    const renoirDb = new Client({
        host: "127.0.0.1",
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB,
    });

    try {
        await renoirDb.connect();
        utils.log("Sucessfully connected to database!", utils.logLevels.success);
        return renoirDb;
    } catch (e) {
        e.message = "Could not connect to database: " + e.message;
        utils.log(e, utils.logLevels.error);
    }
}

async function endConnection(db) {
    db.end().then(() => {
        utils.log("Succesfully closed database connection", utils.logLevels.success);
    }).catch((e) => {
        e.message = "Could not close database connection: " + e.message;
        utils.log(e, utils.logLevels.error);
    });
}

async function getUser(db, user_id) {
    if (!user_id) {
        throw new Error("User is undefined!");
    }

    const text = `SELECT * FROM renoir_users WHERE user_id = '${user_id}'`;

    const res = await db.query(text).catch((e) => {
        e.message = "Could not get user from database: " + e.message;
        utils.log(e, utils.logLevels.error);
        throw e;
    })

    if (res.rowCount == 0) {
        throw new Error("User doesn't have a favorite game");
    }

    utils.log("Sucessfully queried from database", utils.logLevels.success);
    return res.rows[0];
}

async function addUser(db, user_id, username, favorite_game, favorite_game_id) {
    if (!user_id ||!username || !favorite_game || !favorite_game_id)  {
        throw new Error("Undefined value");
    }

    const text = `
        INSERT INTO renoir_users (user_id, username, favorite_game, favorite_game_id)
        SELECT '${user_id}', '${username}', '${favorite_game}', ${favorite_game_id}
        WHERE NOT EXISTS (SELECT user_id FROM renoir_users WHERE user_id = '${user_id}');`;

    return await db.query(text).then(async (result) => {
        if (result.rowCount == 0){
            await updateUser(db, user_id, {
                favorite_game: favorite_game,
                 favorite_game_id: favorite_game_id
                });
        } else {
            utils.log(
                `Sucessfully added ${favorite_game} to ${username} database`,
                utils.logLevels.success
                )
            return result;
        }
    }).catch((e) => {
        e.message = "Could not add user to database: " + e.message;
        utils.log(e, utils.logLevels.error);
        throw e;
    });
}

async function removeUser(db, user_id){
    const text = `
        DELETE FROM renoir_users WHERE user_id = '${user_id}'`;

    await db.query(text).then((result) =>{
        if (result.rowCount == 0) {
            throw Error("User doesn't have a registered game");
        } else {
            utils.log("Sucessfully removed user from database", utils.logLevels.success);
            return result;
        }
    }).catch((e) => {
        utils.log(e, utils.logLevels.error);
        throw e;
    });
}

async function updateUser(db, user_id, game) {
    const text = `
        UPDATE renoir_users
        SET favorite_game_id = '${game.favorite_game_id}', favorite_game = '${game.favorite_game}'
        WHERE user_id = '${user_id}'
    `;

    await db.query(text).then((result) =>{
        utils.log("Sucessfully updated user data", utils.logLevels.success);
        return result;
    }).catch((e) => {
        e.message = "Could not update user data: " + e.message;
        utils.log(e, utils.logLevels.error);
    });
}

async function createTable(db) {
    const text = `
        CREATE TABLE IF NOT EXISTS "renoir_users" (
            "user_id" VARCHAR(25) NOT NULL,
            "username" VARCHAR(99) NOT NULL,
            "favorite_game" VARCHAR(255) NOT NULL,
            "favorite_game_id" int NOT NULL,
            PRIMARY KEY ("user_id")
        );`;

    await db.query(text)
    .then((result) => {
        if (result.rowCount === null) {
            utils.log("Database already got a renoir_users table", utils.logLevels.info);
        } else {
            utils.log("Sucessfully created table", utils.logLevels.success);
        }
    }).catch((e) => {
        e.message = "Could not create table: " + e.message;
        utils.log(e, utils.logLevels.error);
    });
}

module.exports = {
    async getUser(user_id) {
        const db = await connectToDatabase();
        const res = await getUser(db, user_id).catch((e) => {
            endConnection(db);
            throw e;
        });

        endConnection(db);
        return res;
    },

    async addUser(userData) {
        const db = await connectToDatabase();
        await addUser(db, userData.user_id, userData.username,
             userData.favorite_game, userData.favorite_game_id);
        db.end().then(() => {
            utils.log("Succesfully closed database connection", utils.logLevels.success);
        }).catch((e) => {
            e.message = "Could not close database connection: " + e.message;
            utils.log(e, utils.logLevels.error);
        });
    },
    async createTable() {
        const db = await connectToDatabase();
        await createTable(db);
        endConnection(db);
    },
    async removeUser(user_id) {
        const db = await connectToDatabase();
        await removeUser(db, user_id).then((result) => {
            endConnection(db);
            return result;
        }).catch((e) => {
            endConnection(db);
            throw e;
        });
    },
    async updateUser(user_id, favorite_game_id) {
        const db = await connectToDatabase();
        await updateUser(db, user_id, favorite_game_id).then((result) => {
            endConnection(db);
            return result;
        }).catch((e) => {
            endConnection(db);
            throw e;
        });
    }
}