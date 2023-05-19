import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../../structures/Command';
import Embed from '../../utils/Embed';
import { stop } from '../../utils/Utils';

export default new BaseCommand(
  {
    name: '정지',
    description: '재생 중인 노래를 정지해요.',
    aliases: ['정지', 'stop', 's', 'wjdwl'],
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription('해당 명령어는 슬래쉬 커맨드 ( / )로만 사용이 가능합니다.');
    return message.reply({ embeds: [embed] });
  },
  {
    data: new SlashCommandBuilder().setName('정지').setDescription('노래를 정지해요.'),
    async execute(client, interaction) {
      if (!interaction.memberPermissions.has('ManageGuild')) {
        if (!interaction.member || !interaction.member.voice.channel) {
          return interaction.reply({
            embeds: [new Embed(client, 'default').setDescription(`음성채널에 먼저 참여해주세요!`).setColor('#2f3136')],
          });
        }
      }
      const queue = client.music.get(interaction.guildId);

      if (!queue)
        return interaction.reply({
          embeds: [
            new Embed(client, 'default').setDescription(`현재 재생되고 있는 음악이 없습니다.`).setColor('#2f3136'),
          ],
        });

      if (interaction.member.voice.channel?.id !== interaction.guild.members.me?.voice.channel?.id) return interaction.reply({
        embeds: [
          new Embed(client, 'default')
            .setDescription(`명령어를 사용하시려면 ${client.user} 봇이랑 같은 음성채널에 참여해야됩니다!`)
        ]
      })
      if (queue) queue.destroy();
      await client.music.players.delete(interaction?.guild?.id)
      stop(interaction.guild.id, client)

      interaction.reply({
        embeds: [
          new Embed(client, 'success')
            .setTitle('정지')
            .setDescription(' 노래를 정지했어요')
            .addFields({
              name: `요청자`,
              value: `${interaction.member.user}`,
              inline: true,
            })
            .setColor('#2f3136')
        ],
      });
    },
  },
);
