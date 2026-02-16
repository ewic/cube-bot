import { Client, GatewayIntentBits, Collection, Events, Message, Interaction } from 'discord.js';
import sheetsService from './sheets';
import { Card } from './interfaces';
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

// Message handler
client.on(Events.MessageCreate, async (message: Message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Simple ping command
  if (message.content === '!ping') {
    const sent = await message.reply('Pinging...');
    const ping = sent.createdTimestamp - message.createdTimestamp;
    sent.edit(`🏓 Pong! Latency: ${ping}ms | API: ${client.ws.ping}ms`);
  }

  // Help command
  if (message.content === '!help') {
    const helpText = `**📖 Available Commands**\n\n` +
      `**!ping** - Check bot latency\n` +
      `**!sheet** - Read all data from Google Sheets (preview only)\n` +
      `**!buylist** - Show cards that are not owned (sends full list via DM)\n` +
      `**!status <card name>** - Check the status of a specific card\n` +
      `**!pack [count]** - Generate a random pack of cards (default: 15, max: 50)\n` +
      `**!help** - Show this help message\n\n` +
      `*Tip: All commands also work as slash commands (e.g., /ping, /sheet, etc.)*`;

    message.reply(helpText);
  }

  // Read Google Sheets command
  if (message.content.startsWith('!sheet')) {
    try {
      await message.reply('📊 Reading sheet data...');

      const spreadsheetId = process.env.SPREADSHEET_ID;
      const range = 'List!A:F'; // Read columns A to F

      if (!spreadsheetId) {
        return message.reply('❌ SPREADSHEET_ID not configured in environment variables.');
      }

      const cards: Card[] = await sheetsService.readCards(spreadsheetId, range);

      if (cards.length === 0) {
        return message.reply('❌ No data found in the sheet.');
      }

      // Store the complete data as JSON array
      const jsonData = JSON.stringify(cards, null, 2);
      console.log('Sheet data (JSON):', jsonData);

      // Format the data for Discord (showing first 5 cards)
      const preview = cards.slice(0, 5).map((card, index) => {
        return `${index + 1}. **${card.name}** (MV: ${card.MV}) - ${card.type} | ${card.color} | ${card.set} | ${card.status}`;
      }).join('\n');

      message.reply(`✅ Found ${cards.length} cards (columns A-F):\n\n${preview}${cards.length > 5 ? '\n\n... and more' : ''}\n\n*Full JSON logged to console*`);

    } catch (error) {
      console.error('Error reading sheet:', error);
      message.reply('❌ Failed to read sheet. Check your credentials and permissions.');
    }
  }

  // Buylist command - shows cards not owned
  if (message.content.startsWith('!buylist')) {
    try {
      await message.reply('🛒 Reading buylist...');

      const spreadsheetId = process.env.SPREADSHEET_ID;
      const range = 'List!A:F'; // Read columns A to F

      if (!spreadsheetId) {
        return message.reply('❌ SPREADSHEET_ID not configured in environment variables.');
      }

      const cards: Card[] = await sheetsService.readCards(spreadsheetId, range);

      if (cards.length === 0) {
        return message.reply('❌ No data found in the sheet.');
      }

      // Filter cards where status is blank or not 'owned'
      const buylist = cards.filter(card => !card.status || card.status.toLowerCase() !== 'owned');

      if (buylist.length === 0) {
        return message.reply('✅ Buylist is empty - you own all cards!');
      }

      // Store the complete buylist as JSON array
      const jsonData = JSON.stringify(buylist, null, 2);
      console.log('Buylist data (JSON):', jsonData);

      // Format compact preview for channel (showing first 10 cards)
      const preview = buylist.slice(0, 10).map((card, index) => {
        const statusText = card.status ? ` [${card.status}]` : ' [no status]';
        return `${index + 1}. **${card.name}** (MV: ${card.MV}) - ${card.type} | ${card.color}${statusText}`;
      }).join('\n');

      // Format full list as code block for DM
      const cardList = buylist.map((card, index) => {
        const statusText = card.status || 'no status';
        return `${index + 1}. ${card.name} (MV: ${card.MV}) - ${card.type} | ${card.color} | ${card.set} [${statusText}]`;
      }).join('\n');

      const fullOutput = `🛒 **Buylist** - ${buylist.length} cards needed:\n\`\`\`\n${cardList}\n\`\`\``;

      // Send full list via DM
      try {
        if (fullOutput.length > 2000) {
          // Split into multiple messages if needed
          const parts = [];
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
            await message.author.send(part);
          }
        } else {
          await message.author.send(fullOutput);
        }

        // Send compact preview to channel
        message.reply(`🛒 **Buylist** - ${buylist.length} cards needed:\n\n${preview}${buylist.length > 10 ? `\n\n... and ${buylist.length - 10} more` : ''}\n\n📬 *Full list sent via DM!*`);
      } catch (dmError) {
        // If DM fails, send error message
        console.error('Error sending DM:', dmError);
        message.reply('❌ Could not send DM. Please enable DMs from server members in your privacy settings:\nUser Settings → Privacy & Safety → Allow direct messages from server members');
      }

    } catch (error) {
      console.error('Error reading buylist:', error);
      message.reply('❌ Failed to read buylist. Check your credentials and permissions.');
    }
  }

  // Status command - check status of a specific card
  if (message.content.startsWith('!status ')) {
    try {
      const cardName = message.content.slice(8).trim(); // Remove '!status ' prefix

      if (!cardName) {
        return message.reply('❌ Please provide a card name. Usage: `!status <card name>`');
      }

      const spreadsheetId = process.env.SPREADSHEET_ID;
      const range = 'List!A:F'; // Read columns A to F

      if (!spreadsheetId) {
        return message.reply('❌ SPREADSHEET_ID not configured in environment variables.');
      }

      const cards: Card[] = await sheetsService.readCards(spreadsheetId, range);

      if (cards.length === 0) {
        return message.reply('❌ No data found in the sheet.');
      }

      // Search for card by name (case-insensitive)
      const foundCard = cards.find(card => card.name.toLowerCase() === cardName.toLowerCase());

      if (!foundCard) {
        return message.reply(`❌ **${cardName}** is not on the list.`);
      }

      // Format the response
      const statusText = foundCard.status || 'no status';
      const response = `**${foundCard.name}**\n` +
                      `MV: ${foundCard.MV}\n` +
                      `Type: ${foundCard.type}\n` +
                      `Color: ${foundCard.color}\n` +
                      `Set: ${foundCard.set}\n` +
                      `Status: **${statusText}**`;

      message.reply(response);

    } catch (error) {
      console.error('Error checking card status:', error);
      message.reply('❌ Failed to check card status. Please try again.');
    }
  }

  // Pack command - randomly select cards
  if (message.content.startsWith('!pack')) {
    try {
      const args = message.content.slice(6).trim();
      const packSize = args ? parseInt(args) : 15;

      if (isNaN(packSize) || packSize < 1 || packSize > 50) {
        return message.reply('❌ Please provide a valid number between 1 and 50.');
      }

      const spreadsheetId = process.env.SPREADSHEET_ID;
      const range = 'List!A:F'; // Read columns A to F

      if (!spreadsheetId) {
        return message.reply('❌ SPREADSHEET_ID not configured in environment variables.');
      }

      const cards: Card[] = await sheetsService.readCards(spreadsheetId, range);

      if (cards.length === 0) {
        return message.reply('❌ No data found in the sheet.');
      }

      // Randomly select cards
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      const selectedCards = shuffled.slice(0, Math.min(packSize, cards.length));

      // Format the pack
      const packList = selectedCards.map((card, index) => {
        const statusText = card.status || 'no status';
        return `${index + 1}. **${card.name}** (MV: ${card.MV}) - ${card.type} | ${card.color} [${statusText}]`;
      }).join('\n');

      message.reply(`🎲 **Random Pack** - ${selectedCards.length} cards:\n\n${packList}`);

    } catch (error) {
      console.error('Error generating pack:', error);
      message.reply('❌ Failed to generate pack. Please try again.');
    }
  }
});

// Slash command handler
client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Handle ping slash command
  if (interaction.commandName === 'ping') {
    await interaction.reply(`🏓 Pong! API Latency: ${client.ws.ping}ms`);
  }

  // Handle help slash command
  if (interaction.commandName === 'help') {
    const helpText = `**📖 Available Commands**\n\n` +
      `**/ping** - Check bot latency\n` +
      `**/sheet** - Read all data from Google Sheets (preview only)\n` +
      `**/buylist** - Show cards that are not owned (sends full list via DM)\n` +
      `**/status <name>** - Check the status of a specific card\n` +
      `**/pack [count]** - Generate a random pack of cards (default: 15, max: 50)\n` +
      `**/help** - Show this help message\n\n` +
      `*You can also use text commands with ! prefix (e.g., !ping, !sheet)*`;

    await interaction.reply(helpText);
  }

  // Handle sheet slash command
  if (interaction.commandName === 'sheet') {
    await interaction.deferReply();

    try {
      const spreadsheetId = process.env.SPREADSHEET_ID;
      const range = 'List!A:F'; // Read columns A to F

      if (!spreadsheetId) {
        return interaction.editReply('❌ SPREADSHEET_ID not configured in environment variables.');
      }

      const cards: Card[] = await sheetsService.readCards(spreadsheetId, range);

      if (cards.length === 0) {
        return interaction.editReply('❌ No data found in the sheet.');
      }

      // Store the complete data as JSON array
      const jsonData = JSON.stringify(cards, null, 2);
      console.log('Sheet data (JSON):', jsonData);

      // Format the data for Discord (showing first 5 cards)
      const preview = cards.slice(0, 5).map((card, index) => {
        return `${index + 1}. **${card.name}** (MV: ${card.MV}) - ${card.type} | ${card.color} | ${card.set} | ${card.status}`;
      }).join('\n');

      await interaction.editReply(`✅ Found ${cards.length} cards (columns A-F):\n\n${preview}${cards.length > 5 ? '\n\n... and more' : ''}\n\n*Full JSON logged to console*`);

    } catch (error) {
      console.error('Error reading sheet:', error);
      await interaction.editReply('❌ Failed to read sheet. Check your credentials and permissions.');
    }
  }

  // Handle buylist slash command
  if (interaction.commandName === 'buylist') {
    await interaction.deferReply();

    try {
      const spreadsheetId = process.env.SPREADSHEET_ID;
      const range = 'List!A:F'; // Read columns A to F

      if (!spreadsheetId) {
        return interaction.editReply('❌ SPREADSHEET_ID not configured in environment variables.');
      }

      const cards: Card[] = await sheetsService.readCards(spreadsheetId, range);

      if (cards.length === 0) {
        return interaction.editReply('❌ No data found in the sheet.');
      }

      // Filter cards where status is blank or not 'owned'
      const buylist = cards.filter(card => !card.status || card.status.toLowerCase() !== 'owned');

      if (buylist.length === 0) {
        return interaction.editReply('✅ Buylist is empty - you own all cards!');
      }

      // Store the complete buylist as JSON array
      const jsonData = JSON.stringify(buylist, null, 2);
      console.log('Buylist data (JSON):', jsonData);

      // Format compact preview for channel (showing first 10 cards)
      const preview = buylist.slice(0, 10).map((card, index) => {
        const statusText = card.status ? ` [${card.status}]` : ' [no status]';
        return `${index + 1}. **${card.name}** (MV: ${card.MV}) - ${card.type} | ${card.color}${statusText}`;
      }).join('\n');

      // Format full list as code block for DM
      const cardList = buylist.map((card, index) => {
        const statusText = card.status || 'no status';
        return `${index + 1}. ${card.name} (MV: ${card.MV}) - ${card.type} | ${card.color} | ${card.set} [${statusText}]`;
      }).join('\n');

      const fullOutput = `🛒 **Buylist** - ${buylist.length} cards needed:\n\`\`\`\n${cardList}\n\`\`\``;

      // Send full list via DM
      try {
        if (fullOutput.length > 2000) {
          // Split into multiple messages if needed
          const parts = [];
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
            await interaction.user.send(part);
          }
        } else {
          await interaction.user.send(fullOutput);
        }

        // Send compact preview to channel
        await interaction.editReply(`🛒 **Buylist** - ${buylist.length} cards needed:\n\n${preview}${buylist.length > 10 ? `\n\n... and ${buylist.length - 10} more` : ''}\n\n📬 *Full list sent via DM!*`);
      } catch (dmError) {
        // If DM fails, send error message
        console.error('Error sending DM:', dmError);
        await interaction.editReply('❌ Could not send DM. Please enable DMs from server members in your privacy settings:\nUser Settings → Privacy & Safety → Allow direct messages from server members');
      }

    } catch (error) {
      console.error('Error reading buylist:', error);
      await interaction.editReply('❌ Failed to read buylist. Check your credentials and permissions.');
    }
  }

  // Handle status slash command
  if (interaction.commandName === 'status') {
    await interaction.deferReply();

    try {
      const cardName = interaction.options.get('name')?.value as string;

      if (!cardName) {
        return interaction.editReply('❌ Please provide a card name.');
      }

      const spreadsheetId = process.env.SPREADSHEET_ID;
      const range = 'List!A:F'; // Read columns A to F

      if (!spreadsheetId) {
        return interaction.editReply('❌ SPREADSHEET_ID not configured in environment variables.');
      }

      const cards: Card[] = await sheetsService.readCards(spreadsheetId, range);

      if (cards.length === 0) {
        return interaction.editReply('❌ No data found in the sheet.');
      }

      // Search for card by name (case-insensitive)
      const foundCard = cards.find(card => card.name.toLowerCase() === cardName.toLowerCase());

      if (!foundCard) {
        return interaction.editReply(`❌ **${cardName}** is not on the list.`);
      }

      // Format the response
      const statusText = foundCard.status || 'no status';
      const response = `**${foundCard.name}**\n` +
                      `MV: ${foundCard.MV}\n` +
                      `Type: ${foundCard.type}\n` +
                      `Color: ${foundCard.color}\n` +
                      `Set: ${foundCard.set}\n` +
                      `Status: **${statusText}**`;

      await interaction.editReply(response);

    } catch (error) {
      console.error('Error checking card status:', error);
      await interaction.editReply('❌ Failed to check card status. Please try again.');
    }
  }

  // Handle pack slash command
  if (interaction.commandName === 'pack') {
    await interaction.deferReply();

    try {
      const count = (interaction.options.get('count')?.value as number) || 15;

      if (count < 1 || count > 50) {
        return interaction.editReply('❌ Please provide a valid number between 1 and 50.');
      }

      const spreadsheetId = process.env.SPREADSHEET_ID;
      const range = 'List!A:F'; // Read columns A to F

      if (!spreadsheetId) {
        return interaction.editReply('❌ SPREADSHEET_ID not configured in environment variables.');
      }

      const cards: Card[] = await sheetsService.readCards(spreadsheetId, range);

      if (cards.length === 0) {
        return interaction.editReply('❌ No data found in the sheet.');
      }

      // Randomly select cards
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      const selectedCards = shuffled.slice(0, Math.min(count, cards.length));

      // Format the pack
      const packList = selectedCards.map((card, index) => {
        const statusText = card.status || 'no status';
        return `${index + 1}. **${card.name}** (MV: ${card.MV}) - ${card.type} | ${card.color} [${statusText}]`;
      }).join('\n');

      await interaction.editReply(`🎲 **Random Pack** - ${selectedCards.length} cards:\n\n${packList}`);

    } catch (error) {
      console.error('Error generating pack:', error);
      await interaction.editReply('❌ Failed to generate pack. Please try again.');
    }
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
