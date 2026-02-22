import { Message, ChatInputCommandInteraction, User } from 'discord.js';
import cobraService from '../services/cobra';
import { Card } from '../interfaces';

function formatPreview(buylist: Card[]): string {
  return buylist.slice(0, 10).map((card, index) => {
    const statusText = card.status ? ` [${card.status}]` : ' [no status]';
    return `${index + 1}. **${card.name}** (MV: ${card.MV}) - ${card.type} | ${card.color}${statusText}`;
  }).join('\n');
}

async function sendBuylistDM(user: User, buylist: Card[]): Promise<void> {
  const cardList = buylist.map((card, index) => {
    const statusText = card.status || 'no status';
    return `${index + 1}. ${card.name} (MV: ${card.MV}) - ${card.type} | ${card.color} | ${card.set} [${statusText}]`;
  }).join('\n');

  const fullOutput = `🛒 **Buylist** - ${buylist.length} cards needed:\n\`\`\`\n${cardList}\n\`\`\``;

  if (fullOutput.length > 2000) {
    const parts: string[] = [];
    let currentPart = `🛒 **Buylist** - ${buylist.length} cards needed:\n\`\`\`\n`;

    buylist.forEach((card, index) => {
      const statusText = card.status || 'no status';
      const line = `${index + 1}. ${card.name} (MV: ${card.MV}) - ${card.type} | ${card.color} | ${card.set} [${statusText}]\n`;

      if ((currentPart + line + '```').length > 2000) {
        parts.push(currentPart + '```');
        currentPart = '```\n' + line;
      } else {
        currentPart += line;
      }
    });

    if (currentPart.length > 4) {
      parts.push(currentPart + '```');
    }

    for (const part of parts) {
      await user.send(part);
    }
  } else {
    await user.send(fullOutput);
  }
}

export async function handleMessage(message: Message): Promise<void> {
  try {
    await message.reply('🛒 Reading buylist...');

    const cards: Card[] = await cobraService.readCards();

    if (cards.length === 0) {
      message.reply('❌ No cards found in the cube.');
      return;
    }

    const buylist = cards.filter(card => !card.status || card.status.toLowerCase() !== 'owned');

    if (buylist.length === 0) {
      message.reply('✅ Buylist is empty - you own all cards!');
      return;
    }

    const jsonData = JSON.stringify(buylist, null, 2);
    console.log('Buylist data (JSON):', jsonData);

    const preview = formatPreview(buylist);

    try {
      await sendBuylistDM(message.author, buylist);
      message.reply(`🛒 **Buylist** - ${buylist.length} cards needed:\n\n${preview}${buylist.length > 10 ? `\n\n... and ${buylist.length - 10} more` : ''}\n\n📬 *Full list sent via DM!*`);
    } catch (dmError) {
      console.error('Error sending DM:', dmError);
      message.reply('❌ Could not send DM. Please enable DMs from server members in your privacy settings:\nUser Settings → Privacy & Safety → Allow direct messages from server members');
    }

  } catch (error) {
    console.error('Error reading buylist:', error);
    message.reply('❌ Failed to read buylist. Check your CUBECOBRA_ID.');
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

    const buylist = cards.filter(card => !card.status || card.status.toLowerCase() !== 'owned');

    if (buylist.length === 0) {
      await interaction.editReply('✅ Buylist is empty - you own all cards!');
      return;
    }

    const jsonData = JSON.stringify(buylist, null, 2);
    console.log('Buylist data (JSON):', jsonData);

    const preview = formatPreview(buylist);

    try {
      await sendBuylistDM(interaction.user, buylist);
      await interaction.editReply(`🛒 **Buylist** - ${buylist.length} cards needed:\n\n${preview}${buylist.length > 10 ? `\n\n... and ${buylist.length - 10} more` : ''}\n\n📬 *Full list sent via DM!*`);
    } catch (dmError) {
      console.error('Error sending DM:', dmError);
      await interaction.editReply('❌ Could not send DM. Please enable DMs from server members in your privacy settings:\nUser Settings → Privacy & Safety → Allow direct messages from server members');
    }

  } catch (error) {
    console.error('Error reading buylist:', error);
    await interaction.editReply('❌ Failed to read buylist. Check your CUBECOBRA_ID.');
  }
}
