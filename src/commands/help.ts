import { CommandContext } from '../interfaces';

const helpText = `**📖 Available Commands**\n\n` +
  `**/ping** - Check bot latency\n` +
  `**/cube** - View the cube on CubeCobra\n` +
  `**/list** - Read all card data from CubeCobra (preview only)\n` +
  `**/buylist** - Show cards that are not owned (sends full list via DM)\n` +
  `**/status <name>** - Check the status of a specific card\n` +
  `**/pack [count]** - Generate a random pack of cards (default: 15, max: 50)\n` +
  `**/help** - Show this help message\n\n` +
  `*All commands also work with ! prefix (e.g., !ping, !cube)*`;

export async function execute(ctx: CommandContext): Promise<void> {
  await ctx.reply(helpText);
}
