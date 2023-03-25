import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../../structures/Command';
import Embed from '../../utils/Embed';

export default new BaseCommand(
  {
    name: '스킵',
    description: '재생 중인 노래를 스킵 합니다',
    aliases: ['스킵', 'skip', 'tmzlq'],
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription('해당 명령어는 슬래쉬 커맨드 ( / )로만 사용이 가능합니다.');
    return message.reply({ embeds: [embed] });
  },
  {
    data: new SlashCommandBuilder().setName('스킵').setDescription('노래를 스킵해요.'),
    async execute(client, interaction) {
      if (!interaction.member || !interaction.member.voice.channel)
        return interaction.reply({
          embeds: [new Embed(client, 'default').setDescription(`음성채널에 먼저 참여해주세요!`).setColor('#2f3136')],
        });
      const queue = client.music.create({
        guild: interaction.guild.id,
        voiceChannel: interaction.member.voice.channel.id,
        textChannel: interaction.channel?.id!,
      });

      if (!queue || !queue.playing)
        return interaction.reply({
          embeds: [
            new Embed(client, 'default').setDescription(`현재 재생되고 있는 음악이 없습니다.`).setColor('#2f3136'),
          ],
        });

      // if (interaction.member.voice.channel.id !== interaction.guild.me.voice.channel.id) return interaction.reply({
      //   embeds: [
      //     new Embed(client, 'default')
      //       .setDescription(`명령어를 사용하시려면 ${client.user} 봇이랑 같은 음성채널에 참여해야됩니다!`)
      //   ]
      // })

      const currentTrack = queue.queue.current?.title;
      const success = queue.stop();

      return interaction.reply({
        embeds: [
          new Embed(client, 'info')
            .setTitle('🔃 스킵 🔃')
            .setDescription(`\`${currentTrack}\` (을)를 건너뛰었어요!`)
            .addFields({
              name: `요청자`,
              value: `${interaction.user}`,
              inline: true,
            })
            .setColor('#2f3136')
        ],
      });
    },
  },
);
