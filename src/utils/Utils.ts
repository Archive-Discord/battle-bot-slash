import { Player } from 'erela.js';
import BotClient from '../structures/BotClient';
import MusicSetting from '../schemas/musicSchema';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Guild, GuildTextBasedChannel, Message, TextBasedChannel } from 'discord.js';
import Embed from './Embed';
import Logger from './Logger';
import LoggerSetting from '../schemas/LogSettingSchema';

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

export function format(millis?: number) {
  if (!millis) return 'Error!';
  try {
    let s: string | number = Math.floor((millis / 1000) % 60);
    let m: string | number = Math.floor((millis / (1000 * 60)) % 60);
    let h: string | number = Math.floor((millis / (1000 * 60 * 60)) % 24);
    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    return h + ':' + m + ':' + s + ' | ' + Math.floor(millis / 1000) + ' 초';
  } catch (e) {
    console.log(e);
    return 'error!';
  }
}

export function createBar(player: Player) {
  const leftindicator = '[';
  const rightindicator = ']';
  const slider = '🔘';
  const size = 25;
  const line = '▬';
  if (!player.queue.current)
    return `**[${slider}${line.repeat(size - 1)}${rightindicator}**\n**00:00:00 / 00:00:00**`;
  const current =
    player.queue.current.duration !== 0 ? player.position : player.queue.current.duration;
  const total = player.queue.current.duration || 0;

  const bar =
    current > total
      ? [line.repeat((size / 2) * 2), (current / total) * 100]
      : [
        line.repeat(Math.round((size / 2) * (current / total))).replace(/.$/, slider) +
        line.repeat(size - Math.round(size * (current / total)) + 1),
        current / total,
      ];
  if (!String(bar).includes(slider))
    return `**${leftindicator}${slider}${line.repeat(
      size - 1,
    )}${rightindicator}**\n**00:00:00 / 00:00:00**`;
  return `**${leftindicator}${bar[0]}${rightindicator}**\n**${new Date(player.position).toISOString().substring(11, 8) +
    ' / ' +
    (player.queue.current.duration == 0
      ? ' ◉ LIVE'
      : new Date(player.queue.current.duration!).toISOString().substring(11, 8))
    }**`;
}

export async function status(guild_id: string, client: BotClient) {
  const guild = await client.guilds.fetch(guild_id) as Guild;
  const find = await MusicSetting.findOne({ guild_id: guild.id });
  const gdname = guild.name;
  const gdicon = guild.iconURL();
  if (find) {
    const player = client.musics.players.get(guild.id);
    if (!player) return;
    const vaset = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('m_volume_up')
        .setLabel('⬆볼륨UP')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('m_volume_down')
        .setLabel('⬇볼륨DOWN')
        .setStyle(ButtonStyle.Secondary),
    );
    const chid = find.channel_id;
    const msgid_list = find.messageid_list;
    const msgid_banner = find.messageid_banner;
    const channel = client.channels.cache.get(chid);
    if (!channel) return;
    if (!channel.isTextBased()) return;
    const msg_list = await channel.messages.fetch(msgid_list) as Message;
    const msg_banner = await channel.messages.fetch(msgid_banner) as Message;
    if (!msg_list || !msg_banner) return
    const tracks = player.queue;
    const maxTracks = 10; //tracks / Queue Page
    const songs = tracks.slice(0, maxTracks);
    const ss = new Embed(client, 'default')
      .setAuthor({
        name: '재생 중인 노래',
        iconURL:
          'https://images-ext-1.discordapp.net/external/n83quR20ZzWm4y8bO4lnFUWouP0c4rtao8TbXckuvTc/%3Fv%3D1/https/cdn.discordapp.com/emojis/667750713698549781.gif',
      })
      .setTitle(`📃 재생목록 __**${guild.name}**__`)
      .addFields(
        {
          name: `**\` N. \` *${player.queue.length > maxTracks
            ? player.queue.length - maxTracks
            : player.queue.length
            } 개의 노래가 대기중 ...***`,
          value: `\u200b`,
        },
        {
          name: `**\` 0. \` __재생중인 노래__**`,
          value: `**${player.queue.current?.uri
            ? `[${player.queue.current.title
              .substring(0, 60)
              .replace(/\[/giu, '\\[')
              .replace(/\]/giu, '\\]')}](${player.queue.current.uri})`
            : player.queue.current?.title
            }** - \`${player.queue.current?.isStream
              ? `LIVE STREAM`
              : format(player.queue.current?.duration!).split(` | `)[0]
            }\`\n> 신청자: __${(player.queue.current?.requester as any).tag}__`,
        },
      )
      .setDescription(
        String(
          songs
            .map(
              (track, index) =>
                `**\` ${++index}. \` ${track.uri
                  ? `[${track.title
                    .substring(0, 60)
                    .replace(/\[/giu, '\\[')
                    .replace(/\]/giu, '\\]')}](${track.uri})`
                  : track.title
                }** - \`${track.isStream ? `LIVE STREAM` : format(track.duration).split(` | `)[0]
                }\`\n> 신청자: __${(track.requester as any).tag}__`,
            )
            .join(`\n`),
        ).substring(0, 2000).length
          ? String(
            songs
              .map(
                (track, index) =>
                  `**\` ${++index}. \` ${track.uri
                    ? `[${track.title
                      .substring(0, 60)
                      .replace(/\[/giu, '\\[')
                      .replace(/\]/giu, '\\]')}](${track.uri})`
                    : track.title
                  }** - \`${track.isStream
                    ? `LIVE STREAM`
                    : format(track.duration).split(` | `)[0]
                  }\`\n> 신청자: __${(track.requester as any).tag}__`,
              )
              .join(`\n`),
          ).substring(0, 2000)
          : '** **',
      );
    if (guild.iconURL()) await ss.setThumbnail(guild.iconURL())
    const embed = new Embed(client, 'default')
      .setTitle('지금 재생중인 노래')
      .setFooter({ text: gdname })
      .addFields(
        {
          name: `재생시간`,
          value: `\`${format(player.queue.current?.duration!).split(' | ')[0]}\``,
          inline: true,
        },
        { name: `제작자`, value: `\`${player.queue.current?.author}\``, inline: true },
        { name: `남은곡`, value: `\`${player.queue.length} 개\``, inline: true },
      )
      .setImage(
        `https://img.youtube.com/vi/${player.queue.current?.identifier}/mqdefault.jpg`,
      );
    if (guild.iconURL()) await embed.setFooter({ text: gdname, iconURL: gdicon! })
    if (msg_list) await msg_list.edit({ embeds: [ss] });
    if (msg_banner) await msg_banner.edit({ embeds: [embed], components: [vaset] });
  }
}

export async function stop(guild_Id: string, client: BotClient) {
  const guild = await client.guilds.fetch(guild_Id) as Guild;
  const find = await MusicSetting.findOne({ guildid: guild.id });
  if (find) {
    const chid = find.channel_id;
    const msgid_list = find.messageid_list;
    const msgid_banner = find.messageid_banner;
    const channel = client.channels.cache.get(chid) as TextBasedChannel;
    const msg_list = await channel.messages.fetch(msgid_list) as Message;
    const msg_banner = await channel.messages.fetch(msgid_banner) as Message;
    const ss = new Embed(client, 'default')
      .setAuthor({
        name: `**재생 중인 노래**`,
        iconURL: `https://images-ext-1.discordapp.net/external/n83quR20ZzWm4y8bO4lnFUWouP0c4rtao8TbXckuvTc/%3Fv%3D1/https/cdn.discordapp.com/emojis/667750713698549781.gif`,
      })
      .setTitle(`📃 재생목록 __**${guild.name}**__`)
      .setThumbnail(guild.iconURL() ? guild.iconURL() : null)
      .setDescription(`대기중인 노래가 없습니다.`);
    const gg = new Embed(client, 'default')
      .setTitle('재생중인 노래가 없어요')
      .setDescription(
        `❌ **노래가 재생 중이지 않아요!\n해당 채널에 노래 제목을 입력해주세요!**\n[대시보드](https://battlebot.kr/) | [서포트 서버](https://discord.gg/WtGq7D7BZm) | [상태](https://battlebot.kr/status)`,
      )
      .setImage(
        'https://media.discordapp.net/attachments/901745892418256910/941301364095586354/46144c4d9e1cf2e6.png?width=1155&height=657',
      );
    if (msg_list) await msg_list.edit({ embeds: [ss] });
    if (msg_banner) await msg_banner.edit({ embeds: [gg], components: [] });
  }
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

    await logChannel.send({ embeds: [embed] });
  } catch (e) {
    logging.error(e as any)
  }
}

export function checkLogFlag(base: number, required: number | keyof typeof LogFlags): boolean {
  return checkFlag(base, typeof required === 'number' ? required : LogFlags[required])
}

function checkFlag(base: number, required: number) {
  return (base & required) === required
}
