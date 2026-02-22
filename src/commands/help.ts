import { Message, ChatInputCommandInteraction } from 'discord.js';

const messageHelpText = `**📖 Available Commands**\n\n` +
  `**!ping** - Check bot latency\n` +
  `**!cube** - Read all card data from CubeCobra (preview only)\n` +
  `**!buylist** - Show cards that are not owned (sends full list via DM)\n` +
  `**!status <card name>** - Check the status of a specific card\n` +
  `**!pack [count]** - Generate a random pack of cards (default: 15, max: 50)\n` +
  `**!help** - Show this help message\n\n` +
  `*Tip: All commands also work as slash commands (e.g., /ping, /cube, etc.)*`;

const slashHelpText = `**📖 Available Commands**\n\n` +
  `**/ping** - Check bot latency\n` +
  `**/cube** - Read all card data from CubeCobra (preview only)\n` +
  `**/buylist** - Show cards that are not owned (sends full list via DM)\n` +
  `**/status <name>** - Check the status of a specific card\n` +
  `**/pack [count]** - Generate a random pack of cards (default: 15, max: 50)\n` +
  `**/help** - Show this help message\n\n` +
  `*You can also use text commands with ! prefix (e.g., !ping, !cube)*`;

export async function handleMessage(message: Message): Promise<void> {
  message.reply(messageHelpText);
}

export async function handleSlash(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.reply(slashHelpText);
}
