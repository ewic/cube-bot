import { Message, ChatInputCommandInteraction } from 'discord.js';
import cobraService from '../services/cobra';
import { Card } from '../interfaces';

function formatPack(cards: Card[]): string {
  return cards.map((card, index) => {
    const statusText = card.status || 'no status';
    return `${index + 1}. **${card.name}** (MV: ${card.MV}) - ${card.type} | ${card.color} [${statusText}]`;
  }).join('\n');
}

export async function handleMessage(message: Message): Promise<void> {
  try {
    const args = message.content.slice(6).trim();
    const packSize = args ? parseInt(args) : 15;

    if (isNaN(packSize) || packSize < 1 || packSize > 50) {
      message.reply('❌ Please provide a valid number between 1 and 50.');
      return;
    }

    const cards: Card[] = await cobraService.readCards();

    if (cards.length === 0) {
      message.reply('❌ No cards found in the cube.');
      return;
    }

    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    const selectedCards = shuffled.slice(0, Math.min(packSize, cards.length));

    message.reply(`🎲 **Random Pack** - ${selectedCards.length} cards:\n\n${formatPack(selectedCards)}`);

  } catch (error) {
    console.error('Error generating pack:', error);
    message.reply('❌ Failed to generate pack. Please try again.');
  }
}

export async function handleSlash(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  try {
    const count = (interaction.options.get('count')?.value as number) || 15;

    if (count < 1 || count > 50) {
      await interaction.editReply('❌ Please provide a valid number between 1 and 50.');
      return;
    }

    const cards: Card[] = await cobraService.readCards();

    if (cards.length === 0) {
      await interaction.editReply('❌ No cards found in the cube.');
      return;
    }

    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    const selectedCards = shuffled.slice(0, Math.min(count, cards.length));

    await interaction.editReply(`🎲 **Random Pack** - ${selectedCards.length} cards:\n\n${formatPack(selectedCards)}`);

  } catch (error) {
    console.error('Error generating pack:', error);
    await interaction.editReply('❌ Failed to generate pack. Please try again.');
  }
}
