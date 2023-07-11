const fs = require("node:fs");
const path = require("node:path");
const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");

// Setup dotenv and get bot token
require("dotenv").config();
const discordToken = process.env.DISCORDTOKEN;
const twitchClientID = process.env.TWITCH_CLIENT_ID;
const igdbToken = process.env.IGDB_POST_TOKEN;

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
        console.error(`No idea of this command: ${interaction.commandName}`)
        return;
    }

    try {
        await command.execute(interaction);
    } catch (e) {
        console.error(e);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "Meow Meow, either i didn't find the game that you want or you missed a command!!! o_O", ephemeral: true });
        } else {
            await interaction.reply({ content: "Meow Meow, either i didn't find the game that you want or you missed a command!!! o_O", ephemeral: true });
		}
    }
})


// Client only run once;
client.once(Events.ClientReady, c => {
    console.log(`${c.user.tag} is UP!`);
})

client.login(discordToken);


