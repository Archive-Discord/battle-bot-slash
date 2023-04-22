import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../../structures/Command';
import Embed from '../../utils/Embed';
import { createBar, format } from '../../utils/Utils';

export default new BaseCommand(
  {
    name: '현재재생',
    description: '현재 재생중인 곡을 표시해요.',
    aliases: ['현재재생', 'nowplaying', 'guswowotod'],
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription('해당 명령어는 슬래쉬 커맨드 ( / )로만 사용이 가능합니다.');
    return message.reply({ embeds: [embed] });
  },
  {
    data: new SlashCommandBuilder()
      .setName('현재재생')
      .setDescription('현재 재생중인 곡을 표시해요.'),
    async execute(client, interaction) {
      if (!interaction.member || !interaction.member.voice.channel)
        return interaction.reply({
          embeds: [new Embed(client, 'default').setDescription(`음성채널에 먼저 참여해주세요!`).setColor('#2f3136')],
        });
      const queue = client.music.get(interaction.guild.id);

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
      const config = {
        progress_bar: {
          style: 'simple',
          __comment__: "styles: 'simple', 'comlex'",
          leftindicator: '[',
          rightindicator: ']',
          slider: '🔘',
          size: 25,
          line: '▬',
          ___comment___: 'those are for the complex style',
          empty_left: '<:left_empty:909415753265086504>',
          filled_left: '<:left_filled:909415753692897300>',
          empty_right: '<:right_empty:909415753416056832>',
          filled_right: '<:right_filled:909415753135042562>',
          emptyframe: '<:middle_empty:909415753059545139>',
          filledframe: '<:middle_filled:909415753462218792>',
        },
      };
      const embed = new Embed(client, 'success')
        .setAuthor({
          name: `${client.user?.tag}`,
          iconURL: interaction.guild.iconURL()!,
        })
        .setThumbnail(`https://img.youtube.com/vi/${queue.queue.current?.identifier}/mqdefault.jpg`)
        .setURL(queue.queue.current?.uri!)
        .setTitle(`${queue.queue.current?.title}`)
        .addFields(
          { name: `재생률`, value: `${createBar(queue)}` },
          {
            name: `노래시간`,
            value: `\`${format(queue.queue.current?.duration).split(' | ')[0]}\` | \`${format(queue.queue.current?.duration).split(' | ')[1]
              }\``,
            inline: true,
          },
          {
            name: `제작자`,
            value: `\`${queue.queue.current?.author}\``,
            inline: true,
          },
          {
            name: `남은 노래`,
            value: `\`${queue.queue.length} 개\``,
            inline: true,
          },
        )
        .setFooter({
          text: `${(queue.queue.current?.requester as any).tag}`,
          iconURL: (queue.queue.current?.requester as any).displayAvatarURL({
            dynamic: true,
          }),
        })
        .setColor('#2f3136');

      return void interaction.reply({ embeds: [embed] });
    },
  },
);
