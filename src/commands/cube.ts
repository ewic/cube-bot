import { Message, ChatInputCommandInteraction } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

const CUBECOBRA_URL = `https://cubecobra.com/cube/overview/${process.env.CUBECOBRA_ID}`;

export async function handleMessage(message: Message): Promise<void> {
  message.reply(`🔮 View the cube on CubeCobra: ${CUBECOBRA_URL}`);
}

export async function handleSlash(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.reply(`🔮 View the cube on CubeCobra: ${CUBECOBRA_URL}`);
}
