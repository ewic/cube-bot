const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const sheetsService = require('./sheets');
require('dotenv').config();

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
client.on(Events.MessageCreate, async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Simple ping command
  if (message.content === '!ping') {
    const sent = await message.reply('Pinging...');
    const ping = sent.createdTimestamp - message.createdTimestamp;
    sent.edit(`🏓 Pong! Latency: ${ping}ms | API: ${client.ws.ping}ms`);
  }

  // Read Google Sheets command
  if (message.content.startsWith('!sheet')) {
    try {
      await message.reply('📊 Reading sheet data...');
      
      const spreadsheetId = process.env.SPREADSHEET_ID;
      const range = 'List!B:B'; // Adjust range as needed
      
      const data = await sheetsService.readSheetAsObjects(spreadsheetId, range);
      
      if (data.length === 0) {
        return message.reply('❌ No data found in the sheet.');
      }
      
      // Format the data for Discord (showing first 5 rows)
      const preview = data.slice(0, 5).map((row, index) => {
        const rowData = Object.entries(row)
          .map(([key, value]) => `**${key}**: ${value}`)
          .join(', ');
        return `${index + 1}. ${rowData}`;
      }).join('\n');
      
      message.reply(`✅ Found ${data.length} rows:\n\n${preview}${data.length > 5 ? '\n\n... and more' : ''}`);
      
    } catch (error) {
      console.error('Error reading sheet:', error);
      message.reply('❌ Failed to read sheet. Check your credentials and permissions.');
    }
  }
});

// Slash command handler
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Handle ping slash command
  if (interaction.commandName === 'ping') {
    await interaction.reply(`🏓 Pong! API Latency: ${client.ws.ping}ms`);
  }

  // Handle sheet slash command
  if (interaction.commandName === 'sheet') {
    await interaction.deferReply();
    
    try {
      const spreadsheetId = process.env.SPREADSHEET_ID;
      const range = 'Sheet1!A1:Z100'; // Adjust range as needed
      
      const data = await sheetsService.readSheetAsObjects(spreadsheetId, range);
      
      if (data.length === 0) {
        return interaction.editReply('❌ No data found in the sheet.');
      }
      
      // Format the data for Discord (showing first 5 rows)
      const preview = data.slice(0, 5).map((row, index) => {
        const rowData = Object.entries(row)
          .map(([key, value]) => `**${key}**: ${value}`)
          .join(', ');
        return `${index + 1}. ${rowData}`;
      }).join('\n');
      
      await interaction.editReply(`✅ Found ${data.length} rows:\n\n${preview}${data.length > 5 ? '\n\n... and more' : ''}`);
      
    } catch (error) {
      console.error('Error reading sheet:', error);
      await interaction.editReply('❌ Failed to read sheet. Check your credentials and permissions.');
    }
  }
});

// Error handling
client.on(Events.Error, (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Login
client.login(process.env.DISCORD_TOKEN);
