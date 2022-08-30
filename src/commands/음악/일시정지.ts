import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../../structures/Command';
import Embed from '../../utils/Embed';

export default new BaseCommand(
  {
    name: '일시정지',
    description: '',
    aliases: ['pause', '일시정지', 'dlftlwjdwl'],
  },
  async (client, message, args) => {
    message.reply('빗금으로 이전되었습니다.');
  },
  {
    data: new SlashCommandBuilder().setName('일시정지').setDescription('노래를 일시정지해요.'),
    async execute(client, interaction) {
      if (!interaction.member || !interaction.member.voice.channel)
        return interaction.reply({
          embeds: [new Embed(client, 'default').setDescription(`음성채널에 먼저 참여해주세요!`)],
        });
      const queue = client.music.create({
        guild: interaction.guild.id,
        voiceChannel: interaction.member.voice.channel.id,
        textChannel: interaction.channel?.id!,
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
      queue.pause(true);
      let pausedembed = new Embed(client, 'success')
        .setTitle('⏸️ 일시정지 ⏸️')
        .setDescription(`\`${queue.queue.current?.title}\`(이)가 일시정지 되었습니다`)
        .addFields({
          name: `요청자`,
          value: `${interaction.member.user}`,
          inline: true,
        });
      interaction.reply({ embeds: [pausedembed] });
    },
  },
);
