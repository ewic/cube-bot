import { User, Client } from 'discord.js';

export interface Card {
  MV: number;
  name: string;
  type: string;
  color: string;
  set: string;
  status: string;
}

export interface CommandContext {
  reply: (content: string) => Promise<void>;
  user: User;
  client: Client;
  args: Record<string, string | number | boolean>;
}

export interface Filter {

}