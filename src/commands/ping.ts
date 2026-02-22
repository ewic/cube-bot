import { CommandContext } from '../interfaces';

export async function execute(ctx: CommandContext): Promise<void> {
  await ctx.reply(`🏓 Pong! API Latency: ${ctx.client.ws.ping}ms`);
}
