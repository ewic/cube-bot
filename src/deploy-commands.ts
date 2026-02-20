import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

const commands = [
  {
    name: 'help',
    description: 'Show all available commands',
  },
  {
    name: 'ping',
    description: 'Replies with bot latency',
  },
  {
    name: 'cube',
    description: 'Read card data from CubeCobra',
  },
  {
    name: 'buylist',
    description: 'Show cards that are not owned (buylist)',
  },
  {
    name: 'status',
    description: 'Check the status of a specific card',
    options: [
      {
        name: 'name',
        type: 3, // STRING type
        description: 'The name of the card to check',
        required: true,
      },
    ],
  },
  {
    name: 'pack',
    description: 'Generate a random pack of cards',
    options: [
      {
        name: 'count',
        type: 4, // INTEGER type
        description: 'Number of cards in the pack (1-50, default: 15)',
        required: false,
      },
    ],
  },
  // Add more commands here
];

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token) {
  console.error('❌ DISCORD_TOKEN not found in environment variables');
  process.exit(1);
}

if (!clientId) {
  console.error('❌ CLIENT_ID not found in environment variables');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );

    console.log('✅ Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
})();
