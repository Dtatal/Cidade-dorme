import { Events, type Awaitable, type Client, type ClientEvents } from "discord.js";
import path from "node:path"
import fs from "node:fs"
import { error, log, warn } from "./console";
import chalk from "chalk";
import findSimilarValue from "./findSimilarValue";

export default function Evento<const E extends keyof ClientEvents>(name: E, listener: (...args: ClientEvents[E]) => Awaitable<void>, runOnce = false) {
  return {
    register: (client: Client<boolean>) => {
      client[(["on", "once"] as const)[Number(runOnce)]](name, listener)
    },
    name,
  }
}

export function LoadEvents(client: Client<boolean>) {
  const events = Object.values(Events) as string[];
  const folderPath = path.join(__dirname, '..', 'eventos');
  const eventsFolder = fs.readdirSync(folderPath);

  for (const file of eventsFolder) {
    const file_no_ext = file.replace(".ts", "");
    if (!events.includes(file_no_ext)) {
      const mean = findSimilarValue(file_no_ext, events);
      warn(`You have an event file named ${chalk.blueBright`\`${file}\``}. ${file_no_ext} is not a valid event name. \
It is recommended to keep the file name the same as the event name. \
(${mean !== null ? `Did you mean ${chalk.greenBright`\`${mean}.ts\``}?` : 'Could not find a similar event name'})`)
    }
    const filePath = path.join(folderPath, file);
    const event: ReturnType<typeof Evento> = require(filePath).default;
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if (typeof event === "object" && 'name' in event && 'register' in event && typeof event.register === 'function') {
      if (!events.includes(event.name)) {
        const mean = findSimilarValue(event.name, events);
        error(`The event name provided ${chalk.redBright`\`${event.name}\``} is not a valid event name. \
(${mean !== null ? `Did you mean ${chalk.greenBright`\`${mean}\``}?` : 'Could not find a similar event name'})`)
        error(`Could not load event from ${file} because the event name is invalid.`)
        continue;
      }
      if (file_no_ext !== event.name) warn(`You have an event file named ${chalk.blueBright`\`${file}\``} but the event provided for this file is ${chalk.cyanBright`\`${event.name}\``}. \
To avoid confusion, it is recommended to keep the file name the same as the provided event name.`)

      event.register(client);
      log(`Loaded ${chalk.blue`event`} ${event.name}${event.name !== file_no_ext ? ` from ${file}` : ''}`)
    } else {
      error(`The event at eventos/${file} is missing a required "name" or "register" property.`);
    }
  }
}