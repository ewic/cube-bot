import { Message, ChatInputCommandInteraction } from 'discord.js';
import cobraService from '../services/cobra';
import { Card } from '../interfaces';

function formatPreview(cards: Card[]): string {
  return cards.slice(0, 5).map((card, index) => {
    return `${index + 1}. **${card.name}** (MV: ${card.MV}) - ${card.type} | ${card.color} | ${card.set} | ${card.status}`;
  }).join('\n');
}

export async function handleMessage(message: Message): Promise<void> {
  try {
    await message.reply('🔮 Fetching cube data from CubeCobra...');

    const cards: Card[] = await cobraService.readCards();

    if (cards.length === 0) {
      message.reply('❌ No cards found in the cube.');
      return;
    }

    const jsonData = JSON.stringify(cards, null, 2);
    console.log('Cube data (JSON):', jsonData);

    const preview = formatPreview(cards);
    message.reply(`✅ Found ${cards.length} cards in cube:\n\n${preview}${cards.length > 5 ? '\n\n... and more' : ''}\n\n*Full JSON logged to console*`);

  } catch (error) {
    console.error('Error reading cube:', error);
    message.reply('❌ Failed to read cube from CubeCobra. Check your CUBECOBRA_ID.');
  }
}

export async function handleSlash(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  try {
    const cards: Card[] = await cobraService.readCards();

    if (cards.length === 0) {
      await interaction.editReply('❌ No cards found in the cube.');
      return;
    }

    const jsonData = JSON.stringify(cards, null, 2);
    console.log('Cube data (JSON):', jsonData);

    const preview = formatPreview(cards);
    await interaction.editReply(`✅ Found ${cards.length} cards in cube:\n\n${preview}${cards.length > 5 ? '\n\n... and more' : ''}\n\n*Full JSON logged to console*`);

  } catch (error) {
    console.error('Error reading cube:', error);
    await interaction.editReply('❌ Failed to read cube from CubeCobra. Check your CUBECOBRA_ID.');
  }
}
