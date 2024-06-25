import { error } from "../utils/console";
import Evento from "../utils/evento";
import { Database } from "bun:sqlite";
interface ReactionRoleTable {
  message_id: string;
  channel_id: string;
  emoji_id: string;
  role_id: string;
}

function isReactionRoleTable(obj: unknown): obj is ReactionRoleTable {
  const row = obj as Record<string, unknown>;
  return 'message_id' in row && 'channel_id' in row && 'emoji_id' in row && 'role_id' in row;
}

export default Evento("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return;
  if (!reaction.message.guild) return;
  const db = Database.open("database.sqlite");
  const message_id = reaction.message.id;
  const channel_id = reaction.message.channel.id;
  const query = db.prepare(
    "SELECT * FROM ReactionRole WHERE message_id = ? AND channel_id = ? AND emoji_id = ?",
    [message_id, channel_id, reaction.emoji.id === null ? reaction.emoji.name : `<:${reaction.emoji.identifier}>`]
  );
  const row = query.get();
  if (row == null) return;
  if (!isReactionRoleTable(row)) return error("[events/messageReactionRemove.ts] Invalid table structure.");
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  const guildUser = await reaction.message.guild.members.fetch(user.id);
  await guildUser.roles.remove(row.role_id);
})