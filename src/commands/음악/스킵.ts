import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../../structures/Command';
import Embed from '../../utils/Embed';

export default new BaseCommand(
  {
    name: '스킵',
    description: '',
    aliases: ['skip', '스킵', 'tmzlq'],
  },
  async (client, message, args) => {
    message.reply('빗금으로 이전되었습니다.');
  },
  {
    data: new SlashCommandBuilder().setName('스킵').setDescription('노래를 스킵해요.'),
    options: {
      isSlash: true,
    },
    async execute(client, interaction) {
      if (!interaction.member || !interaction.member.voice.channel)
        return interaction.reply({
          embeds: [new Embed(client, 'default').setDescription(`음성채널에 먼저 참여해주세요!`)],
        });
      const queue = client.music.create({
        guild: interaction.guild.id,
        voiceChannel: interaction.member.voice.channel.id,
        textChannel: interaction.channel.id,
      });

      if (!queue || !queue.playing)
        return interaction.reply({
          embeds: [
            new Embed(client, 'default').setDescription(`현재 재생되고 있는 음악이 없습니다.`),
          ],
        });

      // if (interaction.member.voice.channel.id !== interaction.guild.me.voice.channel.id) return interaction.reply({
      //   embeds: [
      //     new Embed(client, 'default')
      //       .setDescription(`명령어를 사용하시려면 ${client.user} 봇이랑 같은 음성채널에 참여해야됩니다!`)
      //   ]
      // })

      const currentTrack = queue.queue.current.title;
      const success = queue.stop();

      return interaction.reply({
        embeds: [
          new Embed(client, 'blue')
            .setTitle('🔃 스킵 🔃')
            .setDescription(`\`${currentTrack}\` (을)를 건너뛰었어요!`)
            .addFields({
              name: `요청자`,
              value: `${interaction.user}`,
              inline: true,
            }),
        ],
      });
    },
  },
);
