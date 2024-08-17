import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message } from 'discord.js';
import { BaseCommand } from '../../structures/Command';
import Embed from '../../utils/Embed';
import { timeFormat } from '../../utils/music/channel.music';
import { MusicRequester } from '../../utils/music/utils.music';

export default new BaseCommand(
  {
    name: '재생목록',
    description: '현재 등록된 노래 목록을 보여줘요',
    aliases: ['재생목록', 'playlist', 'wotodahrfhr'],
  },
  async (client, message, args) => {
    const embed = new Embed(client, 'error')
      .setTitle('❌ 에러 발생')
      .setDescription('해당 명령어는 슬래쉬 커맨드 ( / )로만 사용이 가능합니다.');
    return message.reply({ embeds: [embed] });
  },
  {
    data: new SlashCommandBuilder().setName('재생목록').setDescription('재생목록을 표시해요.'),
    async execute(client, interaction) {
      const { member, guild } = interaction;

      if (!member?.voice.channel) {
        return interaction.reply({
          embeds: [
            new Embed(client, 'default')
              .setDescription('음성채널에 먼저 참여해주세요!')
              .setColor('#2f3136'),
          ],
        });
      }

      const queue = client.lavalink.getPlayer(guild.id);

      if (!queue?.playing) {
        return interaction.reply({
          embeds: [
            new Embed(client, 'default')
              .setDescription('현재 재생되고 있는 음악이 없습니다.')
              .setColor('#2f3136'),
          ],
        });
      }

      if (member.voice.channel.id !== guild.members.me?.voice.channel?.id) {
        return interaction.reply({
          embeds: [
            new Embed(client, 'default')
              .setDescription(`명령어를 사용하시려면 ${client.user} 봇이랑 같은 음성채널에 참여해야됩니다!`)
              .setColor('#2f3136'),
          ],
        });
      }

      const tracks = queue.queue.tracks;
      const maxTracks = 10;
      const songs = tracks.slice(0, maxTracks);

      const currentTrack = queue.queue.current;
      const currentTrackTitle = currentTrack?.info.title || 'Unknown';
      const currentTrackUrl = currentTrack?.info.uri || '';
      const currentTrackFormatted = currentTrackUrl
        ? `[${currentTrackTitle.substring(0, 60).replace(/\[/g, '\\[').replace(/\]/g, '\\]')}](${currentTrackUrl})`
        : currentTrackTitle;
      const currentTrackDuration = currentTrack?.info.isStream
        ? 'LIVE STREAM'
        : timeFormat(currentTrack?.info.duration).split(' | ')[0];

      const songList = songs.map((track, index) => {
        const title = track.info.title.substring(0, 60).replace(/\[/g, '\\[').replace(/\]/g, '\\]');
        const url = track.info.uri ? `[${title}](${track.info.uri})` : title;
        const duration = track.info.isStream ? 'LIVE STREAM' : timeFormat(track.info.duration).split(' | ')[0];
        const requester = track.requester as MusicRequester
        return `**\` ${index + 1}. \` ${url}** - \`${duration}\`\n> 신청자: __${requester.username}__`;
      }).join('\n');

      const description = songList.length > 2000 ? songList.substring(0, 2000) : songList;

      const embed = new Embed(client, 'info')
        .setTitle(`재생목록 \`${guild.name}\``)
        .setColor('#2f3136')
        .addFields(
          {
            name: `**\` N. \` *${tracks.length > maxTracks ? tracks.length - maxTracks : tracks.length} 개의 노래가 대기중 ...***`,
            value: '\u200b',
          },
          {
            name: '**\` 0. \` __재생중인 노래__**',
            value: `**${currentTrackFormatted}** - \`${currentTrackDuration}\`\n> 신청자: __${(currentTrack?.requester as any).tag}__`,
          }
        )
        .setDescription(description);

      return void interaction.reply({ embeds: [embed] });
    },
  }
);