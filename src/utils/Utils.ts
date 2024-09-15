import BotClient from '../structures/BotClient';
import { Guild, GuildTextBasedChannel, Message } from 'discord.js';
import Embed from './Embed';
import Logger from './Logger';
import LoggerSetting from '../schemas/LogSettingSchema';
import custombotSchema from '../schemas/custombotSchema';

export enum LogFlags {
  SERVER_SETTINGS = 2 << 0,
  SERVER_INVITE = 2 << 1,
  USER_JOIN = 2 << 2,
  USER_LEAVE = 2 << 3,
  USER_BAN = 2 << 4,
  USER_KICK = 2 << 5,
  USER_UPDATE = 2 << 6,
  MESSAGE_DELETE = 2 << 7,
  MESSAGE_UPDATE = 2 << 8,
  MESSAGE_REACTION_ADD = 2 << 9,
  CHANNEL_CREATE = 2 << 10,
  CHANNEL_DELETE = 2 << 11,
  CHANNEL_UPDATE = 2 << 12,
  VOICE_CHANNEL_JOIN = 2 << 13,
  VOICE_CHANNEL_LEAVE = 2 << 14,
  EVENT_CREATE = 2 << 15,
  EVENT_UPDATE = 2 << 16,
  EVENT_DELETE = 2 << 17,
  WARNING_CREATE = 2 << 18,
  WARNING_DELETE = 2 << 19,
  VERIFY_SUCCESS = 2 << 20,
  TICKET_CREATE = 2 << 21,
  TICKET_DELETE = 2 << 22,
  TICKET_SAVE = 2 << 23,
}

export enum SOCKET_ACTIONS {
  PING = 'ping',
  PONG = 'pong',
  SEND_WELCOME_MESSAGE = 'sendWelcomeMessage',
  SEND_OUTTING_MESSAGE = 'sendOuttingMessage',
  SEND_LOG_MESSAGE = 'sendLogMessage',
  SEND_MESSAGE = 'sendMessage',
  VERIFY_GENERATE = 'generateVerify',
  VERIFY_REPLY = 'replyVerify',
}

export const sendLoggers = async (client: BotClient, guild: Guild, embed: Embed, logType: number | keyof typeof LogFlags) => {
  const logging = new Logger('Logger')
  try {
    const logger = await LoggerSetting.findOne({
      guild_id: guild.id,
    });
    if (!logger) return;
    if (!checkLogFlag(logger.loggerFlags, logType)) return;

    const logChannel = guild.channels.cache.get(
      logger.guild_channel_id,
    ) as GuildTextBasedChannel;
    if (!logChannel) return;

    const customBot = await custombotSchema.findOne({
      guildId: logChannel.guild?.id,
      useage: true,
    });

    if (customBot) {
      client.socket.emit(SOCKET_ACTIONS.SEND_LOG_MESSAGE, {
        guildId: logChannel.guild?.id,
        channelId: logChannel.id,
        embed: embed.toJSON(),
      })
      return
    } else {
      return await logChannel.send({ embeds: [embed] });
    }
  } catch (e) {
    logging.error(e as any)
  }
}

export const sendSuccess = (message: Message, title: string, description: string, thumbnail?: string) => {
  const sucessembed = new Embed(message.client, 'success')
    .setAuthor({ name: title })
    .setDescription(description)
    .setColor('#2f3136');
  if (thumbnail) {
    sucessembed.setThumbnail(thumbnail);
  }
  return sendTemporaryMessage(message, sucessembed);
}

export const sendError = (message: Message, errorText: string) => {
  const errembed = new Embed(message.client, 'error').setTitle(errorText);
  return sendTemporaryMessage(message, errembed);
}

const sendTemporaryMessage = async (message: Message, embed: Embed) => {
  const m = await message.channel.send({ embeds: [embed] });
  setTimeout(() => {
    m.delete().catch(() => null);
  }, 15000);
}

export function checkLogFlag(base: number, required: number | keyof typeof LogFlags): boolean {
  return checkFlag(base, typeof required === 'number' ? required : LogFlags[required])
}

function checkFlag(base: number, required: number) {
  return (base & required) === required
}
