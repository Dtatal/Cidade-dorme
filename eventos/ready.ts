import { log, error } from "../utils/console";
import Evento from "../utils/evento";
import { ActivityType, Routes } from "discord.js";
import { client_id } from "../config.json";

export default Evento("ready", async client => {
  log(`Ready! Logged in as ${client.user.tag}`);

  client.rest.put(
    Routes.applicationCommands(client_id),
    {
      body: client
        .commands
        ?.map(command => command.data.toJSON())
    })
    .then(r => log(
      `Successfully registered ${(r as { length: number }).length} commands.`)
    )
    .catch(error);
  setInterval(() => {
    if (client.ws.ping >= 200) {
      client.user.setPresence({ activities: [{ name: 'Discord API', state: `A API do Discord está lenta (${client.ws.ping}ms)`, type: ActivityType.Custom }], status: 'dnd' });
    } else {
      client.user.setStatus('online');
      client.user.setActivity();
    }
  }, 10000);
}, true)