import { SlashCommandBuilder } from '@discordjs/builders';
import { BaseCommand } from '../../structures/Command';
import Embed from '../../utils/Embed';

export default new BaseCommand(
  {
    name: '재개',
    description: '재생 중인 노래를 노래를 재개해요.',
    aliases: ['재개', 'resume', 'woro'],
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription('해당 명령어는 슬래쉬 커맨드 ( / )로만 사용이 가능합니다.');
    return message.reply({ embeds: [embed] });
  },
  {
    data: new SlashCommandBuilder().setName('재개').setDescription('노래를 재개해요.'),
    async execute(client, interaction) {
      if (!interaction.member || !interaction.member.voice.channel)
        return interaction.reply({
          embeds: [new Embed(client, 'default').setDescription(`음성채널에 먼저 참여해주세요!`).setColor('#2f3136')],
        });
      if (!client.user || !interaction.guild.members.me?.voice.channel)
        return interaction.reply({
          embeds: [
            new Embed(client, 'default').setDescription(`음... 재생중인 노래가 없어보이네요`).setColor('#2f3136'),
          ],
        });
      const queue = client.lavalink.getPlayer(interaction.guild.id);
      if (interaction.member.voice.channel.id !== interaction.guild.members.me.voice.channel.id) return interaction.reply({
        embeds: [
          new Embed(client, 'default')
            .setDescription(`명령어를 사용하시려면 ${client.user} 봇이랑 같은 음성채널에 참여해야됩니다!`)
        ]
      })
      if (queue.paused) {
        await queue.resume();
      }
      let pausedembed = new Embed(client, 'success')
        .setTitle('⏯️ 재개 ⏯️')
        .setDescription(`\`${queue?.queue.current?.info.title}\`(이)가 재개 되고 있습니다`)
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
