import { Client, Message, ChatInputCommandInteraction } from 'discord.js';

export async function handleMessage(message: Message, client: Client): Promise<void> {
  const sent = await message.reply('Pinging...');
  const ping = sent.createdTimestamp - message.createdTimestamp;
  sent.edit(`🏓 Pong! Latency: ${ping}ms | API: ${client.ws.ping}ms`);
}

export async function handleSlash(interaction: ChatInputCommandInteraction, client: Client): Promise<void> {
  await interaction.reply(`🏓 Pong! API Latency: ${client.ws.ping}ms`);
}
