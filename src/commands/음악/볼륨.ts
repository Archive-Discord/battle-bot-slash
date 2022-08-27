import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../../structures/Command';
import Embed from '../../utils/Embed';

export default new BaseCommand(
  {
    name: '볼륨',
    description: '',
    aliases: ['volume', '볼륨', 'qhffba'],
  },
  async (client, message, args) => {
    message.reply('빗금으로 이전되었습니다.');
  },
  {
    // @ts-ignore
    data: new SlashCommandBuilder()
      .setName('볼륨')
      .setDescription('설정할 볼륨을 적어주세요')
      .addIntegerOption((options) =>
        options.setName('볼륨').setDescription('설정할 볼륨을 적어주세요').setRequired(true),
      ),
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

      // if (interaction.member.voice.channel.id !== interaction.guild.me.voice.channelID) return interaction.reply({
      //   embeds: [
      //    new Embed(client, 'default')
      //       .setDescription(`명령어를 사용하시려면 ${client.user} 봇이랑 같은 음성채널에 참여해야됩니다!`)
      //   ]
      // })
      const arg1 = interaction.options.getInteger('볼륨', true);

      if (!queue || !queue.playing)
        return interaction.reply({
          embeds: [new Embed(client, 'warn').setDescription(`재생중인 노래가 없습니다.`)],
        });

      if (arg1 < 0 || arg1 > 150)
        return void interaction.reply({
          embeds: [
            new Embed(client, 'warn').setDescription(`볼륨은 0~150까지만 조절 할 수 있습니다`),
          ],
        });
      queue.setVolume(Number(arg1));

      return interaction.reply({
        embeds: [new Embed(client, 'success').setTitle('🎧 볼륨 🎧').setDescription(`${arg1}%`)],
      });
    },
  },
);
