import cobraService from '../services/cobra';
import { Card, CommandContext } from '../interfaces';

function formatPreview(cards: Card[]): string {
  return cards.slice(0, 5).map((card, index) => {
    return `${index + 1}. **${card.name}** (MV: ${card.MV}) - ${card.type} | ${card.color} | ${card.set} | ${card.status}`;
  }).join('\n');
}

export async function execute(ctx: CommandContext): Promise<void> {
  try {
    const cards: Card[] = await cobraService.readCards();

    if (cards.length === 0) {
      await ctx.reply('❌ No cards found in the cube.');
      return;
    }

    const jsonData = JSON.stringify(cards, null, 2);
    console.log('Cube data (JSON):', jsonData);

    const preview = formatPreview(cards);
    await ctx.reply(`✅ Found ${cards.length} cards in cube:\n\n${preview}${cards.length > 5 ? '\n\n... and more' : ''}\n\n*Full JSON logged to console*`);

  } catch (error) {
    console.error('Error reading cube:', error);
    await ctx.reply('❌ Failed to read cube from CubeCobra. Check your CUBECOBRA_ID.');
  }
}
