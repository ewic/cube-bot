import { Client, GatewayIntentBits, Collection, Events, Message, Interaction } from 'discord.js';
import { ping, help, cube, list, buylist, status, pack } from './commands';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Store commands in a collection
client.commands = new Collection();

// Ready event
client.once(Events.ClientReady, (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
});

// Message handler
client.on(Events.MessageCreate, async (message: Message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  if (message.content === '!ping') {
    ping.handleMessage(message, client);
  }

  if (message.content === '!help') {
    help.handleMessage(message);
  }

  if (message.content.startsWith('!cube')) {
    cube.handleMessage(message);
  }

  if (message.content.startsWith('!list')) {
    list.handleMessage(message);
  }

  if (message.content.startsWith('!buylist')) {
    buylist.handleMessage(message);
  }

  if (message.content.startsWith('!status ')) {
    status.handleMessage(message);
  }

  if (message.content.startsWith('!pack')) {
    pack.handleMessage(message);
  }
});

// Slash command handler
client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    ping.handleSlash(interaction, client);
  }

  if (interaction.commandName === 'help') {
    help.handleSlash(interaction);
  }

  if (interaction.commandName === 'cube') {
    cube.handleSlash(interaction);
  }

  if (interaction.commandName === 'list') {
    list.handleSlash(interaction);
  }

  if (interaction.commandName === 'buylist') {
    buylist.handleSlash(interaction);
  }

  if (interaction.commandName === 'status') {
    status.handleSlash(interaction);
  }

  if (interaction.commandName === 'pack') {
    pack.handleSlash(interaction);
  }
});

// Error handling
client.on(Events.Error, (error: Error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error: Error) => {
  console.error('Unhandled promise rejection:', error);
});

// Login
if (!process.env.DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN not found in environment variables');
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
