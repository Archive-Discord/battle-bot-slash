import { channelMention, ChatInputCommandInteraction, Guild, Message, TextBasedChannel, TextChannel } from "discord.js";
import MusicSetting from "../../schemas/musicSchema";
import BotClient from "../../structures/BotClient";
import Embed from "../Embed";
import { Player, Track } from "lavalink-client";
import { MusicRequester } from "./utils.music";

export async function liveStatus(guild_id: string, client: BotClient) {
  const guild = await fetchGuild(client, guild_id);
  if (!guild) return;

  const musicSetting = await MusicSetting.findOne({ guild_id: guild.id });
  if (!musicSetting) return;

  const player = client.lavalink.players.get(guild.id);
  if (!player) return;

  const channel = client.channels.cache.get(musicSetting.channel_id) as TextChannel;
  if (!channel || !channel.isTextBased()) return;

  const msg_list = await fetchMessage(channel, musicSetting.messageid_list);
  const msg_banner = await fetchMessage(channel, musicSetting.messageid_banner);
  if (!msg_list || !msg_banner) return;

  const maxTracks = 10;
  const tracks = player.queue.tracks.slice(0, maxTracks);

  const queueEmbed = createQueueEmbed(client, guild, player, tracks, maxTracks);
  const nowPlayingEmbed = createNowPlayingEmbed(client, guild, player);

  await msg_list.edit({ embeds: [queueEmbed] });
  await msg_banner.edit({ embeds: [nowPlayingEmbed] });
}

export async function liveStatusDelete(guild_id: string, client: BotClient) {
  const guild = await fetchGuild(client, guild_id);
  if (!guild) return;

  const musicSetting = await MusicSetting.findOne({ guild_id: guild.id });
  if (!musicSetting) return;

  const channel = client.channels.cache.get(musicSetting.channel_id) as TextChannel;
  if (!channel || !channel.isTextBased()) return;

  const msg_list = await fetchMessage(channel, musicSetting.messageid_list)
  const msg_banner = await fetchMessage(channel, musicSetting.messageid_banner)
  if (!msg_list || !msg_banner) return;

  const queueEmbed = createEmptyQueueEmbed(client, guild);
  const nowPlayingEmbed = createEmptyMusicEmbed(client, guild);

  await msg_list.edit({ embeds: [queueEmbed] });
  await msg_banner.edit({ embeds: [nowPlayingEmbed], components: [] });
}

export async function currentStatusDisconnected(player: Player, voiceChannelId: string, client: BotClient) {
  const channel = await client.channels.fetch(player.textChannelId!).catch(() => null) as TextChannel;
  if (!channel || !channel.isTextBased()) return;

  const currentEmbed = new Embed(client, 'warn')
    .setDescription(`${channelMention(voiceChannelId)} 채널과 연결이 끊겨 재생을 정지합니다!`)
  const currentMessage = await channel.send({ embeds: [currentEmbed] });

  setTimeout(() => {
    currentMessage.delete().catch(() => null);
  }, 15000);
}

export async function currntStatusEmpty(player: Player, client: BotClient) {
  const channel = await client.channels.fetch(player.textChannelId!).catch(() => null) as TextChannel;
  if (!channel || !channel.isTextBased()) return;

  const currentEmbed = new Embed(client, 'info')
    .setTitle('모든 노래가 끝났어요!')
    .setDescription(
      `추가한 모든 노래가 재생되어 음악 재생이 종료되었어요!`,
    )

  const currentMessage = await channel.send({ embeds: [currentEmbed] });

  setTimeout(() => {
    currentMessage.delete().catch(() => null);
  }, 15000);
}

export async function currentStatus(textChannelId: string, track: Track, client: BotClient) {
  const channel = client.channels.cache.get(textChannelId) as TextChannel;
  if (!channel || !channel.isTextBased()) return;

  const currentEmbed = new Embed(client, 'success')
    .setTitle("🎶 노래를 재생합니다! 🎶")
    .setURL(`${track.info.uri}`)
    .setDescription(`\`${track.info.title}\`` + `(이)가 지금 재생되고 있습니다!`)
    .setFields(
      { name: `길이`, value: `\`${timeFormat(track.info.duration).split(" | ")[0]}\` | \`${timeFormat(track.info.duration).split(" | ")[1]}\``, inline: true },
      { name: `게시자`, value: `${track.info.author}`, inline: true },
    )

  if (track.info.artworkUrl) currentEmbed.setThumbnail(`${track.info.artworkUrl}`);

  const currentMessage = await channel.send({ embeds: [currentEmbed] });

  setTimeout(() => {
    currentMessage.delete().catch(() => null);
  }, 15000);
}


async function fetchGuild(client: BotClient, guild_id: string): Promise<Guild | null> {
  return client.guilds.cache.get(guild_id) || await client.guilds.fetch(guild_id).catch(() => null);
}

async function fetchMessage(channel: TextBasedChannel, messageId: string): Promise<Message | null> {
  return channel.messages.fetch(messageId).catch(() => null);
}

function createQueueEmbed(client: BotClient, guild: Guild, player: any, tracks: any[], maxTracks: number): Embed {
  const songList = tracks.map((track, index) => {
    const title = track.info.title.substring(0, 60).replace(/\[/giu, '\\[').replace(/\]/giu, '\\]');
    const duration = track.info.isStream ? 'LIVE STREAM' : timeFormat(track.info.duration);
    const requester = track.requester as MusicRequester;
    return `**\` ${index + 1}. \` [${title}](${track.info.uri})** - \`${duration.split(' | ')[0]}\`\n> 신청자: __${requester.username}__`;
  }).join('\n');
  const requester = player.queue.current?.requester as MusicRequester;
  return new Embed(client, 'default')
    .setAuthor({
      name: '재생 중인 노래',
      iconURL: 'https://cdn.discordapp.com/emojis/667750713698549781.gif?v=1',
    })
    .setTitle(`📃 재생목록 __**${guild.name}**__`)
    .setDescription(songList || '** **')
    .addFields(
      {
        name: `**\` N. \` *${player.queue.tracks.length > maxTracks
          ? player.queue.tracks.length - maxTracks
          : player.queue.tracks.length} 개의 노래가 대기중 ...***`,
        value: `\u200b`,
      },
      {
        name: `**\` 0. \` __재생중인 노래__**`,
        value: `**[${player.queue.current?.info.title.substring(0, 60).replace(/\[/giu, '\\[').replace(/\]/giu, '\\]')}](${player.queue.current?.info.uri})** - \`${player.queue.current?.info.isStream ? 'LIVE STREAM' : timeFormat(player.queue.current?.info.duration).split(' | ')[0]}\`\n> 신청자: __${requester.username}__`,
      }
    )
    .setThumbnail(guild.iconURL());
}

function createNowPlayingEmbed(client: BotClient, guild: Guild, player: any): Embed {
  return new Embed(client, 'default')
    .setTitle('지금 재생중인 노래')
    .setFooter({ text: guild.name, iconURL: guild.iconURL()! })
    .addFields(
      { name: `재생시간`, value: `\`${timeFormat(player.queue.current?.info.duration).split(' | ')[0]}\``, inline: true },
      { name: `제작자`, value: `\`${player.queue.current?.info.author}\``, inline: true },
      { name: `남은곡`, value: `\`${player.queue.tracks.length} 개\``, inline: true }
    )
    .setImage(player.queue.current?.info.artworkUrl || null);
}

function createEmptyQueueEmbed(client: BotClient, guild: Guild): Embed {
  return new Embed(client, 'default')
    .setAuthor({
      name: `**재생 중인 노래**`,
      iconURL: `https://images-ext-1.discordapp.net/external/n83quR20ZzWm4y8bO4lnFUWouP0c4rtao8TbXckuvTc/%3Fv%3D1/https/cdn.discordapp.com/emojis/667750713698549781.gif`,
    })
    .setTitle(`📃 재생목록 __**${guild.name}**__`)
    .setThumbnail(guild.iconURL() || null)
    .setDescription(`대기중인 노래가 없습니다.`);
}

function createEmptyMusicEmbed(client: BotClient, guild: Guild): Embed {
  return new Embed(client, 'default')
    .setTitle('재생중인 노래가 없어요')
    .setDescription(
      `❌ **노래가 재생 중이지 않아요!\n해당 채널에 노래 제목을 입력해주세요!**\n[대시보드](https://battlebot.kr/) | [서포트 서버](https://discord.gg/WtGq7D7BZm) | [상태](https://battlebot.kr/status)`
    )
    .setImage(
      'https://media.discordapp.net/attachments/901745892418256910/941301364095586354/46144c4d9e1cf2e6.png?width=1155&height=657',
    );
}

export function timeFormat(millis?: number): string {
  if (!millis) return 'Error!';
  const s = Math.floor((millis / 1000) % 60).toString().padStart(2, '0');
  const m = Math.floor((millis / (1000 * 60)) % 60).toString().padStart(2, '0');
  const h = Math.floor((millis / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
  return `${h}:${m}:${s} | ${Math.floor(millis / 1000)} 초`;
}

export const createPlayer = async (client: BotClient, message: Message | ChatInputCommandInteraction<'cached'>): Promise<Player | null> => {
  try {
    const hasPlayer = client.lavalink.getPlayer(message.guildId!);
    if (hasPlayer) return hasPlayer
    const player = client.lavalink.createPlayer({
      guildId: message.guildId!,
      voiceChannelId: message.member?.voice.channelId!,
      textChannelId: message.channel?.id!,
      vcRegion: message.member?.voice.channel?.rtcRegion || undefined,
      instaUpdateFiltersFix: true,
    });
    player.connect();
    return player;
  } catch (e) {
    if (message.guild)
      client.lavalink.players.get(message.guild.id)?.destroy();
    return null;
  }
}

export const playIfNotPlaying = async (player: Player) => {
  if (!player.playing && !player.paused) {
    await player.play();
  }
}
