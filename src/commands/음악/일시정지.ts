import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../../structures/Command';
import Embed from '../../utils/Embed';

export default new BaseCommand(
  {
    name: '일시정지',
    description: '재생 중인 노래를 일시정지합니다',
    aliases: ['일시정지', 'pause', 'dlftlwjdwl'],
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription('해당 명령어는 슬래쉬 커맨드 ( / )로만 사용이 가능합니다.');
    return message.reply({ embeds: [embed] });
  },
  {
    data: new SlashCommandBuilder().setName('일시정지').setDescription('노래를 일시정지해요.'),
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
      queue.pause(true);
      let pausedembed = new Embed(client, 'success')
        .setTitle('⏸️ 일시정지 ⏸️')
        .setDescription(`\`${queue.queue.current?.title}\`(이)가 일시정지 되었습니다`)
        .addFields({
          name: `요청자`,
          value: `${interaction.member.user}`,
          inline: true,
        })
        .setColor('#2f3136');
      interaction.reply({ embeds: [pausedembed] });
    },
  },
);
