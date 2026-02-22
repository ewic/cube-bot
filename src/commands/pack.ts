import cobraService from '../services/cobra';
import { Card, CommandContext } from '../interfaces';

function formatPack(cards: Card[]): string {
  return cards.map((card, index) => {
    const statusText = card.status || 'no status';
    return `${index + 1}. **${card.name}** (MV: ${card.MV}) - ${card.type} | ${card.color} [${statusText}]`;
  }).join('\n');
}

export async function execute(ctx: CommandContext): Promise<void> {
  try {
    const packSize = (ctx.args.count as number) || 15;

    if (packSize < 1 || packSize > 50) {
      await ctx.reply('❌ Please provide a valid number between 1 and 50.');
      return;
    }

    const cards: Card[] = await cobraService.readCards();

    if (cards.length === 0) {
      await ctx.reply('❌ No cards found in the cube.');
      return;
    }

    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    const selectedCards = shuffled.slice(0, Math.min(packSize, cards.length));

    await ctx.reply(`🎲 **Random Pack** - ${selectedCards.length} cards:\n\n${formatPack(selectedCards)}`);

  } catch (error) {
    console.error('Error generating pack:', error);
    await ctx.reply('❌ Failed to generate pack. Please try again.');
  }
}
