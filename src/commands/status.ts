import cobraService from '../services/cobra';
import { Card, CommandContext } from '../interfaces';

function formatCardResponse(card: Card): string {
  const statusText = card.status || 'no status';
  return `**${card.name}**\n` +
    `MV: ${card.MV}\n` +
    `Type: ${card.type}\n` +
    `Color: ${card.color}\n` +
    `Set: ${card.set}\n` +
    `Status: **${statusText}**`;
}

export async function execute(ctx: CommandContext): Promise<void> {
  try {
    const cardName = ctx.args.name as string;

    if (!cardName) {
      await ctx.reply('❌ Please provide a card name. Usage: `/status <card name>`');
      return;
    }

    const cards: Card[] = await cobraService.readCards();

    if (cards.length === 0) {
      await ctx.reply('❌ No cards found in the cube.');
      return;
    }

    const foundCard = cards.find(card => card.name.toLowerCase() === cardName.toLowerCase());

    if (!foundCard) {
      await ctx.reply(`❌ **${cardName}** is not in the cube.`);
      return;
    }

    await ctx.reply(formatCardResponse(foundCard));

  } catch (error) {
    console.error('Error checking card status:', error);
    await ctx.reply('❌ Failed to check card status. Please try again.');
  }
}
