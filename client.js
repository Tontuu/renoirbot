const fs = require("node:fs");
const path = require("node:path");
const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");


// Setup constants
const ERROR_MSG = "Meow, i think you missed how to use the command properly!!! o_O";

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
        console.log(`[ERROR]: Missing ${filePath}`);
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`[ERROR]: Unknown command: ${interaction.commandName}`)
        return;
    }

    try {
        await command.execute(interaction);
    } catch (e) {
        console.error(e);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: ERROR_MSG, ephemeral: true });
        } else {
            await interaction.reply({ content: ERROR_MSG, ephemeral: true });
		}
    }
})

// Client only run once;
client.once(Events.ClientReady, c => {
    console.log(`[INFO]: ${c.user.tag} is UP!`);
})

client.login(discordToken);


