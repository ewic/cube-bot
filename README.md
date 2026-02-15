# Discord.js Bot Boilerplate

A clean, simple Discord bot built with Discord.js v14.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create a Discord application:**
   - Go to https://discord.com/developers/applications
   - Click "New Application"
   - Go to the "Bot" tab and create a bot
   - Copy your bot token

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Add your bot token to the `.env` file

4. **Invite the bot to your server:**
   - Go to OAuth2 → URL Generator
   - Select scopes: `bot`, `applications.commands`
   - Select permissions you need (e.g., Send Messages, Read Messages)
   - Copy and visit the generated URL

5. **Run the bot:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## Features

- Message commands (prefix: `!`)
- Slash commands support
- Basic error handling
- Example ping command
- **Google Sheets integration** - Read data from spreadsheets

## Commands

- `!ping` - Check bot latency
- `/ping` - Slash command version
- `!sheet` or `/sheet` - Read data from Google Sheets

## Google Sheets Setup

To enable Google Sheets integration, see **[GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md)** for detailed instructions.

Quick summary:
1. Create a Google Cloud project
2. Enable Google Sheets API
3. Create a service account and download credentials
4. Share your Google Sheet with the service account email
5. Add credentials to your `.env` file

## Project Structure

```
.
├── bot.js                    # Main bot file
├── sheets.js                 # Google Sheets service
├── deploy-commands.js        # Deploy slash commands
├── package.json              # Dependencies
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore file
├── README.md                 # This file
└── GOOGLE_SHEETS_SETUP.md    # Google Sheets setup guide
```

## Next Steps

- Register slash commands using `deploy-commands.js`
- Add command handler for better organization
- Add event handlers in separate files
- Implement database integration
- Add more features!
