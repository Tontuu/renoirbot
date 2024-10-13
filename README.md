> Edit .env file with your bot's config

## Overview
The Renoir Bot is a simple bot that allows users to search for video game information directly from Discord. The bot fetches data from the IGDB (Internet Game Database) API and returns results based on user queries, including details such as game titles, descriptions, release dates, platforms, and more.

# ⚙  Setup
**Prerequisites**
- Node.js v14 or higher.
- Discord Developer Portal account to create a bot.
- IGDB API access via Twitch Developer.

## Misc
```
Ocasionally you should generate a new IGDB Token with
"https://id.twitch.tv/oauth2/token?client_id=YOUR_ID&client_secret=YOUR_SECRET&grant_type=client_credentials"
and update your .env IGDB_POST_TOKEN var
```

## Installation
Clone this repository:
```bash
git clone https://github.com/Tontuu/renoirbot.git
cd renoirbot
```

## Install dependencies:
```bash
npm install
```

## Set up environment variables by creating a .env file in the project root:
```bash
DISCORDTOKEN=your-discord-bot-token
TWITCH_CLIENT_ID=your-twitch-client-id
TWITCH_CLIENT_SECRET=your-twitch-client-secret
```

## Start the bot:
```sh
npm start # Be happy
```

## To-Do
**- [ ] - Fix howlongtobeat**

# 📄 License
This project is licensed under the MIT License.