import { Message, ChatInputCommandInteraction } from 'discord.js';
import cobraService from '../services/cobra';
import { Card } from '../interfaces';

function formatCardResponse(card: Card): string {
  const statusText = card.status || 'no status';
  return `**${card.name}**\n` +
    `MV: ${card.MV}\n` +
    `Type: ${card.type}\n` +
    `Color: ${card.color}\n` +
    `Set: ${card.set}\n` +
    `Status: **${statusText}**`;
}

export async function handleMessage(message: Message): Promise<void> {
  try {
    const cardName = message.content.slice(8).trim();

    if (!cardName) {
      message.reply('❌ Please provide a card name. Usage: `!status <card name>`');
      return;
    }

    const cards: Card[] = await cobraService.readCards();

    if (cards.length === 0) {
      message.reply('❌ No cards found in the cube.');
      return;
    }

    const foundCard = cards.find(card => card.name.toLowerCase() === cardName.toLowerCase());

    if (!foundCard) {
      message.reply(`❌ **${cardName}** is not in the cube.`);
      return;
    }

    message.reply(formatCardResponse(foundCard));

  } catch (error) {
    console.error('Error checking card status:', error);
    message.reply('❌ Failed to check card status. Please try again.');
  }
}

export async function handleSlash(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  try {
    const cardName = interaction.options.get('name')?.value as string;

    if (!cardName) {
      await interaction.editReply('❌ Please provide a card name.');
      return;
    }

    const cards: Card[] = await cobraService.readCards();

    if (cards.length === 0) {
      await interaction.editReply('❌ No cards found in the cube.');
      return;
    }

    const foundCard = cards.find(card => card.name.toLowerCase() === cardName.toLowerCase());

    if (!foundCard) {
      await interaction.editReply(`❌ **${cardName}** is not in the cube.`);
      return;
    }

    await interaction.editReply(formatCardResponse(foundCard));

  } catch (error) {
    console.error('Error checking card status:', error);
    await interaction.editReply('❌ Failed to check card status. Please try again.');
  }
}
