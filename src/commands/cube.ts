import * as dotenv from 'dotenv';
import { CommandContext } from '../interfaces';

dotenv.config();

const CUBECOBRA_URL = `https://cubecobra.com/cube/overview/${process.env.CUBECOBRA_ID}`;

export async function execute(ctx: CommandContext): Promise<void> {
  await ctx.reply(`🔮 View the cube on CubeCobra: ${CUBECOBRA_URL}`);
}
