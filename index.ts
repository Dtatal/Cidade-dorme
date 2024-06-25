import { Client, Collection, GatewayIntentBits, Partials, type SlashCommandBuilder } from 'discord.js';
import { token } from './config.json';
import { LoadCommands } from './utils/comando';
import { LoadEvents } from './utils/evento';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction
  ]
});

client.commands = new Collection();

LoadCommands(client);
LoadEvents(client);

client.login(token);