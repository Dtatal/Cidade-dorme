import type { Collection, SlashCommandBuilder } from "discord.js";
import type Comando from "./utils/comando";

declare module 'discord.js' {
  interface Client {
    commands?: Collection<string, {
      data: SlashCommandBuilder,
      execute: (
        interaction: ChatInputCommandInteraction<CacheType>,
        args: Parameters<Parameters<typeof Comando>['0']['fn']>['1']
      ) => Promise<void>,
      getArgs: (
        interaction: ChatInputCommandInteraction<CacheType>
      ) => Parameters<Parameters<typeof Comando>['0']['fn']>['1']
    }>;
  }
}