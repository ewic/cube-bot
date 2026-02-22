import { Client, GatewayIntentBits, Collection, Events, Message, Interaction } from 'discord.js';
import { ping, help, cube, list, buylist, status, pack } from './commands';
import { CommandContext } from './interfaces';
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

function messageContext(message: Message, args: Record<string, string | number | boolean> = {}): CommandContext {
  return {
    reply: async (content: string) => { await message.reply(content); },
    user: message.author,
    client,
    args,
  };
}

// Commands that need deferral (they make API calls to CubeCobra)
const DEFERRED_COMMANDS = ['list', 'buylist', 'status', 'pack'];

// Message handler
client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    ping.execute(messageContext(message));
  }

  if (message.content === '!help') {
    help.execute(messageContext(message));
  }

  if (message.content.startsWith('!cube')) {
    cube.execute(messageContext(message));
  }

  if (message.content.startsWith('!list')) {
    list.execute(messageContext(message));
  }

  if (message.content.startsWith('!buylist')) {
    buylist.execute(messageContext(message));
  }

  if (message.content.startsWith('!status ')) {
    const name = message.content.slice(8).trim();
    status.execute(messageContext(message, { name }));
  }

  if (message.content.startsWith('!pack')) {
    const arg = message.content.slice(6).trim();
    const count = arg ? parseInt(arg) : 15;
    if (isNaN(count)) {
      message.reply('❌ Please provide a valid number between 1 and 50.');
      return;
    }
    pack.execute(messageContext(message, { count }));
  }
});

// Slash command handler
client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (DEFERRED_COMMANDS.includes(commandName)) {
    await interaction.deferReply();
  }

  const ctx = (args: Record<string, string | number | boolean> = {}): CommandContext => {
    const replyFn = DEFERRED_COMMANDS.includes(commandName)
      ? async (content: string) => { await interaction.editReply(content); }
      : async (content: string) => { await interaction.reply(content); };
    return {
      reply: replyFn,
      user: interaction.user,
      client,
      args,
    };
  };

  if (commandName === 'ping') {
    ping.execute(ctx());
  }

  if (commandName === 'help') {
    help.execute(ctx());
  }

  if (commandName === 'cube') {
    cube.execute(ctx());
  }

  if (commandName === 'list') {
    list.execute(ctx());
  }

  if (commandName === 'buylist') {
    buylist.execute(ctx());
  }

  if (commandName === 'status') {
    const name = (interaction.options.get('name')?.value as string) || '';
    status.execute(ctx({ name }));
  }

  if (commandName === 'pack') {
    const count = (interaction.options.get('count')?.value as number) || 15;
    pack.execute(ctx({ count }));
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
