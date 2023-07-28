import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../../structures/Command';
import Embed from '../../utils/Embed';
import { format } from '../../utils/Utils';

export default new BaseCommand(
  {
    name: '재생목록',
    description: '현재 등록된 노래 목록을 보여줘요',
    aliases: ['재생목록', 'playlist', 'wotodahrfhr'],
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription('해당 명령어는 슬래쉬 커맨드 ( / )로만 사용이 가능합니다.');
    return message.reply({ embeds: [embed] });
  },
  {
    data: new SlashCommandBuilder().setName('재생목록').setDescription('재생목록을 표시해요.'),
    async execute(client, interaction) {
      if (!interaction.member || !interaction.member.voice.channel)
        return interaction.reply({
          embeds: [new Embed(client, 'default').setDescription(`음성채널에 먼저 참여해주세요!`).setColor('#2f3136')],
        });
      const queue = client.musics.get(interaction.guild.id);

      if (!queue || !queue.playing)
        return interaction.reply({
          embeds: [
            new Embed(client, 'default').setDescription(`현재 재생되고 있는 음악이 없습니다.`).setColor('#2f3136'),
          ],
        });
      if (interaction.member.voice.channel.id !== interaction.guild.members.me?.voice.channel?.id) return interaction.reply({
        embeds: [
          new Embed(client, 'default')
            .setDescription(`명령어를 사용하시려면 ${client.user} 봇이랑 같은 음성채널에 참여해야됩니다!`)
        ]
      })
      const tracks = queue.queue;
      var maxTracks = 10; //tracks / Queue Page
      var songs = tracks.slice(0, maxTracks);

      const embed = new Embed(client, 'info')
        .setTitle(`재생목록 \`${interaction.guild.name}\``)
        .setColor('#2f3136')
        .addFields(
          {
            name: `**\` N. \` *${queue.queue.length > maxTracks ? queue.queue.length - maxTracks : queue.queue.length
              } 개의 노래가 대기중 ...***`,
            value: `\u200b`,
          },
          {
            name: `**\` 0. \` __재생중인 노래__**`,
            value: `**${queue.queue.current?.uri
              ? `[${queue.queue.current.title
                .substring(0, 60)
                .replace(/\[/giu, '\\[')
                .replace(/\]/giu, '\\]')}](${queue.queue.current.uri})`
              : queue.queue.current?.title
              }** - \`${queue.queue.current?.isStream
                ? `LIVE STREAM`
                : format(queue.queue.current?.duration).split(` | `)[0]
              // @ts-ignore
              }\`\n> 신청자: __${queue.queue.current.requester.tag}__`,
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
          ).substring(0, 2000),
        );
      return void interaction.reply({ embeds: [embed] });
    },
  },
);
