import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../../structures/Command';
import Embed from '../../utils/Embed';

export default new BaseCommand(
  {
    name: '반복재생',
    description: '',
    aliases: ['반복재생', 'repeat'],
  },
  async (client, message, args) => {
    message.reply('빗금으로 이전되었습니다.');
  },
  {
    data: new SlashCommandBuilder()
      .setName('반복재생')
      .setDescription('음악을 반복하여 재생합니다.'),
    async execute(client, interaction) {
      if (!interaction.member || !interaction.member.voice.channel)
        return interaction.reply({
          embeds: [new Embed(client, 'error').setDescription(`음성채널에 먼저 참여해주세요!`)],
        });
      const queue = client.music.create({
        guild: interaction.guild.id,
        voiceChannel: interaction.member.voice.channel.id,
        textChannel: interaction.channel?.id!,
      });

      if (!queue || !queue.playing)
        return interaction.reply({
          embeds: [
            new Embed(client, 'error').setDescription(`현재 재생되고 있는 음악이 없습니다.`),
          ],
        });

      // if (interaction.member.voice.channel.id !== interaction.guild.me.voice.channelID) return interaction.reply({
      //   embeds: [
      //     new Embed(client, 'default')
      //       .setDescription(`명령어를 사용하시려면 ${client.user} 봇이랑 같은 음성채널에 참여해야됩니다!`)
      //   ]
      // })
      if (queue.queueRepeat === false) {
        queue.setQueueRepeat(true);

        const embed = new Embed(client, 'default')
          .setTitle('🔁 반복재생 🔁')
          .setDescription(`반복재생 모드가 활성화 되었어요`)
          .addFields({
            name: `요청자`,
            value: `${interaction.member.user}`,
            inline: true,
          });

        interaction.reply({ embeds: [embed] });
      } else if (queue.queueRepeat === true) {
        queue.setQueueRepeat(false);

        const embed = new Embed(client, 'default')
          .setTitle('🔁 반복재생 🔁')
          .setDescription(`반복재생 모드가 비활성화 되었어요`)
          .addFields({
            name: `요청자`,
            value: `${interaction.member.user}`,
            inline: true,
          });

        interaction.reply({ embeds: [embed] });
      } else {
        return interaction.reply({
          embeds: [new Embed(client, 'default').setDescription(`잘못된 경로로 접근하셨습니다`)],
        });
      }
    },
  },
);
