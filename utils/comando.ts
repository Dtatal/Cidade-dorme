import type {
  CacheType,
  ChatInputCommandInteraction,
  Role,
  APIRole,
  TextChannel,
  Attachment,
  GuildMember,
  APIInteractionDataResolvedGuildMember,
  User,
  ApplicationCommandOptionBase,
  Client
} from "discord.js";
import { SlashCommandBuilder } from "discord.js"
import { error, log } from "./console";
import path from "node:path"
import fs from "node:fs"
import chalk from "chalk";
type Args = {
  nome: string,
  descrição: string,
  obrigatório: boolean,
  tipo: ArgsType,
}

// biome-ignore lint/style/useEnumInitializers: <explanation>
enum ArgsType {
  /**
   * Um arquivo anexado à mensagem.
   */
  Attachment,
  /**
   * Um valor booleano.
   */
  Boolean,
  /**
   * Um canal de texto.
   */
  Channel,
  /**
   * Um número inteiro.
   */
  Integer,
  /**
   * Algo que pode ser mencionado, como um usuário ou um cargo.
   */
  Mentionable,
  /**
   * Um número, seja inteiro ou decimal.
   */
  Number,
  /**
   * Um cargo.
   */
  Role,
  /**
   * Uma string de texto.
   */
  String,
  /**
   * Um usuário.
   */
  User,
}

type ArgRole = Role | APIRole;
type ArgChannel = TextChannel;
type ArgAttachment = Attachment;
type ArgMember = GuildMember | APIInteractionDataResolvedGuildMember;
type ArgMentionable = GuildMember | APIInteractionDataResolvedGuildMember | Role | APIRole | User;
type ArgUser = User;

type RawArg<T extends ArgsType> = T extends ArgsType.Attachment
  ? ArgAttachment
  : T extends ArgsType.Boolean
  ? boolean
  : T extends ArgsType.Channel
  ? ArgChannel
  : T extends ArgsType.Integer
  ? number
  : T extends ArgsType.Mentionable
  ? ArgMentionable
  : T extends ArgsType.Number
  ? number
  : T extends ArgsType.Role
  ? ArgRole
  : T extends ArgsType.String
  ? string
  : T extends ArgsType.User
  ? ArgUser
  : never;
type Arg<T extends ArgsType, R extends boolean> = R extends true ? RawArg<T> : RawArg<T> | null;

function Comando<const A extends Args[]>(args: {
  detalhes: {
    descrição: string,
    args: A,
  },
  fn: (interaction: ChatInputCommandInteraction<CacheType>, args: {
    [K in A[number]['nome']]: Arg<Extract<A[number], { nome: K }>['tipo'], Extract<A[number], { nome: K }>['obrigatório']>
  }) => Promise<void>
}) {
  return (name: string) => {
    const data = new SlashCommandBuilder()
      .setName(name)
      .setDescription(args.detalhes.descrição);

    const add_option = ["addAttachmentOption", "addBooleanOption", "addChannelOption", "addIntegerOption", "addMentionableOption", "addNumberOption", "addRoleOption", "addStringOption", "addUserOption"] as const
    const get_options = ["getAttachment", "getBoolean", "getChannel", "getInteger", "getMentionable", "getNumber", "getRole", "getString", "getUser"] as const

    for (const arg of args.detalhes.args) {
      const setInputs = <T extends ApplicationCommandOptionBase>(input: T): T => input
        .setName(arg.nome)
        .setDescription(arg.descrição)
        .setRequired(arg.obrigatório)

      data[add_option[arg.tipo]](setInputs)
    }

    type CommandArgs = Parameters<Parameters<typeof Comando>['0']['fn']>['1']

    function getArgs(interaction: ChatInputCommandInteraction<CacheType>): CommandArgs {
      const args_: CommandArgs = {};
      type Option = (name: string, required?: boolean) => CommandArgs[string];
      for (const arg of args.detalhes.args) {
        args_[arg.nome] = (interaction.options[get_options[arg.tipo]] as Option)(arg.nome, arg.obrigatório);
      }
      return args_;
    }

    return {
      data,
      execute: args.fn,
      getArgs,
    }

  }
}

Comando.detalhes = SlashCommandBuilder;
Comando.arg_type = ArgsType;

export default Comando;

export function LoadCommands(client: Client<boolean>) {
  if (!client.commands) throw new Error("Client does not have a commands collection.");
  const folderPath = path.join(__dirname, '..', 'comandos');
  const commandFolder = fs.readdirSync(folderPath);

  for (const file of commandFolder) {
    const filePath = path.join(folderPath, file);
    const raw_command: ReturnType<typeof Comando> = require(filePath).default;
    const command = raw_command(file.replace(".ts", ""));
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if (typeof command === "object" && 'data' in command && 'execute' in command && 'getArgs' in command) {
      client.commands?.set(command.data.name, command);
      log(`Loaded ${chalk.green`command`} ${command.data.name}`)
    } else {
      error(`The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}