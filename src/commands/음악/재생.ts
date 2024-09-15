import { SlashCommandBuilder } from '@discordjs/builders';
import { BaseCommand } from '../../structures/Command';
import Embed from '../../utils/Embed';
import { createPlayer, liveStatus, playIfNotPlaying, timeFormat } from '../../utils/music/channel.music';

export default new BaseCommand(
  {
    name: '재생',
    description: '듣고 싶은 노래를 재생해요.',
    aliases: ['재생', 'p', 'play', 'wotod'],
  },
  async (client, message, args) => {
  },
  {
    // @ts-ignore
    data: new SlashCommandBuilder()
      .setName('재생')
      .setDescription('노래를 재생해요.')
      .addStringOption((option) =>
        option
          .setName('query')
          .setDescription('재생할 노래 재목 또는 링크를 적어주세요')
          .setRequired(true)
      ),
    async execute(client, interaction) {
      await interaction.deferReply();
      const search = interaction.options.getString('query');
      if (!interaction.member || !interaction.member.voice.channel)
        return interaction.followUp({
          embeds: [new Embed(client, 'default').setDescription(`음성채널에 먼저 참여해주세요!`)],
        });
      const player = await createPlayer(client, interaction);

      if (!search)
        return interaction.followUp({
          embeds: [
            new Embed(client, 'default').setDescription(
              `음악의 제목이나 유튜브 링크를 알려주세요!`,
            ),
          ],
        });
      let song;

      if (!player) return interaction.followUp(`노래를 재생할 수 없습니다.`);

      try {
        song = await player.search(search, interaction.user);
        if (song.loadType == 'error') {
          if (!player.queue.current) player.destroy();
          throw new Error(song.exception?.message);
        }
      } catch (err: any) {
        return interaction.followUp(`검색중 오류가 발생했습니다.: ${err.message}`);
      }
      if (!player.connected) {
        await player.connect();
        await player.stopPlaying();
      }

      if (song.playlist) {
        player.queue.add(song.tracks);
        const songTitles = song.tracks.map(track => track.info.title);
        const embed = new Embed(client, 'info')
          .setTitle('🎶 재생목록에 추가합니다! 🎶')
          .setDescription(`\`${songTitles.join(', ')}\` (이)가 재생목록에 추가되었습니다!`)
          .setColor('#2f3136');

        interaction.followUp({ embeds: [embed] });
      } else {
        player.queue.add(song.tracks[0]);
        const embed = new Embed(client, 'info')
          .setTitle('🎶 노래를 재생목록에 추가합니다! 🎶')
          .setURL(`${song.tracks[0].info.uri}`)
          .setDescription(`\`${song.tracks[0].info.title}\` (이)가 재생목록에 추가되었습니다!`)
          .addFields(
            {
              name: `길이`,
              value: `\`${timeFormat(song.tracks[0].info.duration).split(' | ')[0]}\``,
              inline: true,
            },
            { name: `게시자`, value: `${song.tracks[0].info.author}`, inline: true },
          )
          .setThumbnail(`${song.tracks[0].info.artworkUrl}`)
          .setColor('#2f3136');

        interaction.followUp({ embeds: [embed] });
      }

      await playIfNotPlaying(player);

      liveStatus(interaction.guild.id, client)
    },
  },
);
