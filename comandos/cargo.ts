import { Database } from "bun:sqlite"
import { PermissionsBitField, type TextChannel } from "discord.js";
import Comando from "../utils/comando";

export default Comando({
  detalhes: {
    descrição: "Teste de comando",
    args: [
      {
        nome: "cargo",
        descrição: "Cargo para adicionar",
        obrigatório: true,
        tipo: Comando.arg_type.Role
      },
      {
        nome: "canal",
        descrição: "Canal da mensagem",
        obrigatório: true,
        tipo: Comando.arg_type.Channel
      },
      {
        nome: "id_mensagem",
        descrição: "ID da mensagem",
        obrigatório: true,
        tipo: Comando.arg_type.String
      },
      {
        nome: "emoji",
        descrição: "Emoji",
        obrigatório: true,
        tipo: Comando.arg_type.String
      }
    ]
  },
  fn: async (interaction, args) => {
    const client = interaction.client;
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const id_mensagem = args.id_mensagem.split("-").pop()!;

    const mensagem = await client.channels.fetch(args.canal.id).then(channel => (channel as TextChannel | null)?.messages.fetch(id_mensagem));

    if (!mensagem) {
      await interaction.reply({
        content: "[ERRO] Mensagem não encontrada.",
        ephemeral: true
      });
      return;
    }

    const guild = interaction.guild;
    const me = guild?.members.me

    if (me == null || guild == null) {
      await interaction.reply({
        content: "[ERRO] Erro ao obter informações do servidor.",
        ephemeral: true
      });
      return;
    }

    if (!me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      await interaction.reply({
        content: "[ERRO] Não tenho permissão para gerenciar cargos.",
        ephemeral: true
      });
      return;
    }

    if (!me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      await interaction.reply({
        content: "[ERRO] Não tenho permissão para gerenciar mensagens.",
        ephemeral: true
      });
      return;
    }

    if (!me.permissions.has(PermissionsBitField.Flags.AddReactions)) {
      await interaction.reply({
        content: "[ERRO] Não tenho permissão para adicionar reações.",
        ephemeral: true
      });
      return;
    }

    const cargo = await guild.roles.fetch(args.cargo.id);

    if (cargo == null) {
      await interaction.reply({
        content: "[ERRO] Cargo não encontrado.",
        ephemeral: true
      });
      return;
    }

    if (!cargo.editable) {
      await interaction.reply({
        content: `[ERRO] Não tenho permissão para aplicar o cargo <@&${cargo.id}>`,
        ephemeral: true,
      });
      return;
    }

    const db = Database.open("database.sqlite");
    const query = db.prepare(
      "INSERT INTO ReactionRole (message_id, channel_id, role_id, emoji_id) VALUES (?, ?, ?, ?)",
      [
        id_mensagem,
        args.canal.id,
        args.cargo.id,
        args.emoji
      ]
    );
    query.run();
    await mensagem.react(args.emoji);

    // client.on("messageReactionAdd", async (reaction, user) => {
    //   if (reaction.message.id === args.id_mensagem && reaction.emoji.name === args.emoji) {
    //     const membro = await interaction.guild?.members.fetch(user.id);
    //     membro?.roles.add(args.cargo.id);
    //   }
    // });

    // client.on("messageReactionRemove", async (reaction, user) => {
    //   if (reaction.message.id === args.id_mensagem && reaction.emoji.name === args.emoji) {
    //     const membro = await interaction.guild?.members.fetch(user.id);
    //     membro?.roles.remove(args.cargo.id);
    //   }
    // });

    interaction.reply({
      embeds: [
        {
          description: `A partir de agora, irei adicionar o cargo <@&${args.cargo.id}> para todos que reagirem com ${args.emoji} na mensagem ${id_mensagem}, no canal <#${args.canal.id}>.`
        }
      ]
    });
  }
})