const utils = require("./utils");
const db = require("./db");
const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const {
    Client,
    Events,
    GatewayIntentBits,
    Collection, 
    ActivityType
 } = require("discord.js");

// Setup dotenv and get bot token
require("dotenv").config();
const discordToken = process.env.DISCORDTOKEN;

// Setup main client
const client = new Client({intents:[GatewayIntentBits.Guilds]});

// Setup commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandsFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    } else {
        utils.log(`Missing ${filePath}`, utils.logLevels.error);
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        utils.log(
            `Unknown command: ${interaction.commandName}`,
            utils.logLevels.error);
        return;
    }
    try {
        await command.execute(interaction, client);
    } catch (e) {
        e.message = "Error on Client: " + e.message;
        utils.log(e, utils.logLevels.error);
    }
})


    
// Client only run once;
client.once(Events.ClientReady, c => {
    utils.log(`${c.user.tag} is UP!`, utils.logLevels.success);
    client.user.setActivity('Pantheon', { type: ActivityType.Competing });
})

client.login(discordToken).then(() => {
    app.listen(port, () => {
        utils.log(`Running server on 'http://localhost:${port}'`,
                utils.logLevels.success);
        db.createTable().catch((e) => {
            throw e;
        });
    })
}).catch((e) => {
    utils.log(e, utils.logLevels.fatal);
});

// Server
const app = express();
const port = 2000;

app.get("/stats", (req, res) => {
    const stats = {
        uptime: process.uptime().toFixed(2) + "s",
        status: "RUNNING",
        timestamp: Date.now()
    };

    try {
        res.send(stats);
    } catch (e) {
        stats.status = e;
        res.status(503).send();
    }
})

