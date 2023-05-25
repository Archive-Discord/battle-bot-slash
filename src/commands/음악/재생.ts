import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message, EmbedBuilder, GuildChannel } from 'discord.js';
import { BaseCommand } from '../../structures/Command';
import Embed from '../../utils/Embed';
import { format, status } from '../../utils/Utils';

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
      const queue = client.music.create({
        guild: interaction.guild.id,
        voiceChannel: interaction.member.voice.channel.id,
        textChannel: interaction.channel?.id!,
        region: interaction.member.voice.channel?.rtcRegion || undefined,
        instaUpdateFiltersFix: true,
      });
      if (!search)
        return interaction.followUp({
          embeds: [
            new Embed(client, 'default').setDescription(
              `음악의 제목이나 유튜브 링크를 알려주세요!`,
            ),
          ],
        });
      let res;

      try {
        res = await client.music.search(search, interaction.user);
        if (res.loadType === 'LOAD_FAILED') throw res.exception;
        else if (res.loadType === 'PLAYLIST_LOADED')
          throw { message: '이 명령에서는 재생 목록을 지원하지 않습니다.' };
      } catch (err: any) {
        return interaction.followUp(`검색중 오류가 발생했습니다.: ${err.message}`);
      }
      if (!queue?.connected) {
        await queue?.connect();
        await queue?.stop();
      }
      queue.queue.add(res.tracks[0]);

      if (!queue.playing && !queue.paused && !queue.queue.size) queue.play();

      const embed = new Embed(client, 'info')
        .setTitle('🎶 노래를 재생목록에 추가합니다! 🎶')
        .setURL(`${res.tracks[0].uri}`)
        .setDescription(`\`${res.tracks[0].title}\` (이)가 재생목록에 추가되었습니다!`)
        .addFields(
          {
            name: `길이`,
            value: `\`${format(res.tracks[0].duration).split(' | ')[0]}\``,
            inline: true,
          },
          { name: `게시자`, value: `${res.tracks[0].author}`, inline: true },
        )
        .setThumbnail(`${res.tracks[0].thumbnail}`)
        .setColor('#2f3136');
      interaction.followUp({ embeds: [embed] });
      status(interaction.guild.id, client)
    },
  },
);
