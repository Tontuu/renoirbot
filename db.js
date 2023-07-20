const { Client } = require("pg");

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
        await renoirDb.connect()
        console.log("[SUCCESS:DB]: Sucessfully connected to database!");
        return renoirDb;
    } catch (e) {
        console.error("[ERROR:DB]: Could not connect to database:", e);
    }
}

async function endConnection(db) {
    db.end().then(() => {
        console.log("[SUCCESS:DB]: Succesfully closed database connection");
    }).catch((e) => {
        console.error("[ERROR:DB]: Could not close database connection:", e);
    });
}

async function getUser(db, user_id) {
    if (!user_id) {
        throw new Error("User is undefined!");
    }

    const text = `SELECT * FROM renoir_users WHERE user_id = '${user_id}'`;

    const res = await db.query(text).catch((e) => {
        console.error("[ERROR:DB]: Could not get user from database:", e.message);
        throw e;
    })

    if (res.rowCount == 0) {
        throw new Error("User doesn't have a favorite game");
    }

    console.log(`[SUCCESS:DB] Sucessfully queried from database`);
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

    // TODO: Vanish values before adding to database

    return await db.query(text).then((result) => {
        if (result.rowCount == 0){
            throw new Error("User has already been registered to database");
        } else {
            console.log(`[SUCCESS:DB] Sucessfully added ${favorite_game} to ${username} database`);
            return result;
        }
    }).catch((e) => {
        console.error("[ERROR:DB]: Could not add user to database:", e.message);
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
            console.log("[SUCCESS:DB] Sucessfully removed user from database");
            return result;
        }
    }).catch((e) => {
        console.error("[ERROR:DB]: Could not remove user from database:", e.message);
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
        console.log("[SUCCESS:DB] Sucessfully updated user data");
        return result;
    }).catch((e) => {
        console.error("[ERROR:DB]: Could not update user data:", e.message);
        throw e;
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
    .then(() => {
        console.log("[SUCCESS:DB] Sucessfully created table");
    }).catch((e) => {
        console.error("[ERROR:DB]: Could not create table:", e);
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
            console.log("[SUCCESS:DB]: Succesfully closed database connection");
        }).catch((e) => {
            console.error("[ERROR:DB]: Could not close database connection:", e);
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