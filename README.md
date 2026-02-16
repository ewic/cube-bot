# Discord Cube Bot

A TypeScript-based Discord bot for managing card collections with Google Sheets integration.

## Features

- 📊 **Google Sheets Integration** - Read card data from Google Sheets
- 🛒 **Buylist Management** - Track which cards you don't own
- 🔍 **Card Status Lookup** - Check the status of specific cards
- 🎲 **Random Pack Generator** - Generate random card packs
- 📖 **Help Command** - Easy-to-use help system
- 🔐 **TypeScript** - Full type safety

## Commands

| Command | Description |
|---------|-------------|
| `/help` or `!help` | Show all available commands |
| `/ping` or `!ping` | Check bot latency |
| `/sheet` or `!sheet` | Read all data from Google Sheets |
| `/buylist` or `!buylist` | Show cards not owned (DM) |
| `/status <name>` or `!status <name>` | Check status of a card |
| `/pack [count]` or `!pack [count]` | Random pack (default: 15) |

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.default` to `.env` and fill in your values:

```bash
cp .env.default .env
```

Required variables:
- `DISCORD_TOKEN` - Your Discord bot token
- `CLIENT_ID` - Your Discord application client ID
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Google service account email
- `GOOGLE_PRIVATE_KEY` - Google service account private key
- `SPREADSHEET_ID` - Your Google Sheets spreadsheet ID

### 3. Build the Project

```bash
npm run build
```

### 4. Deploy Slash Commands

```bash
npm run deploy
```

### 5. Run the Bot

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## Development Scripts

- `npm run dev` - Run with ts-node (hot reload)
- `npm run watch` - Run with nodemon (auto-restart)
- `npm run build` - Compile TypeScript
- `npm run deploy` - Deploy slash commands to Discord

## Deployment

See [CONTAINER_DEPLOYMENT.md](CONTAINER_DEPLOYMENT.md) for detailed instructions on deploying to QNAP Container Station or any Docker environment.

**Quick Deploy to QNAP Container Station:**
```bash
# Build the bot
npm run build

# Build Docker image
docker build -t discord-cube-bot .

# Save image for QNAP
docker save discord-cube-bot:latest | gzip > discord-cube-bot-image.tar.gz

# Transfer to QNAP and import via Container Station UI
```

## Project Structure

```
discord-cube-bot/
├── src/
│   ├── bot.ts                  # Main bot file
│   ├── sheets.ts               # Google Sheets service
│   ├── interfaces.ts           # TypeScript interfaces
│   ├── types.d.ts              # Type declarations
│   └── deploy-commands.ts      # Slash command registration
├── dist/                       # Compiled JavaScript (generated)
├── .env                        # Environment variables (DO NOT COMMIT)
├── .env.default                # Environment template
├── Dockerfile                  # Docker container definition
├── docker-compose.yml          # Docker Compose configuration
├── .dockerignore               # Docker ignore file
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies
├── CONTAINER_DEPLOYMENT.md     # Container deployment guide
└── README.md                   # This file
```

## Card Data Format

The bot expects a Google Sheet with the following columns (A-F):

| Column | Name | Type | Description |
|--------|------|------|-------------|
| A | MV | Integer | Mana value |
| B | Name | String | Card name |
| C | Type | String | Card type |
| D | Color | String | Card color |
| E | Set | String | Set name |
| F | Status | String | Ownership status (e.g., "owned") |

## Technologies

- **TypeScript** - Type-safe JavaScript
- **Discord.js v14** - Discord bot framework
- **Google APIs** - Sheets integration
- **dotenv** - Environment configuration

## License

MIT
