import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionsBitField, ChannelType } from 'discord.js';
import { BaseCommand } from '../../structures/Command';
import Schema from '../../schemas/musicSchema';
import Embed from '../../utils/Embed';

export default new BaseCommand(
  {
    name: '뮤직설정해제',
    description: '설치형 뮤직 시스템을 설정을 해제합니다.',
    aliases: ['뮤직설정해제', 'musicclear', 'musicclear', '뮤직초기화', '뮤직초기화'],
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription('해당 명령어는 슬래쉬 커맨드 ( / )로만 사용이 가능합니다.');
    return message.reply({ embeds: [embed] });
  },
  {
    data: new SlashCommandBuilder()
      .setName('뮤직설정해제')
      .setDescription('설치형 뮤직 시스템을 설정을 해제합니다.'),
    async execute(client, interaction) {
      if (!interaction.member?.permissions.has([PermissionsBitField.Flags.Administrator]))
        return interaction.reply({
          embeds: [
            new Embed(client, 'error')
              .setTitle('권한이 없습니다.')
              .setDescription(`서버에 관리자 권한이 부족하여 사용이 불가능합니다.`)
          ],
        });
      const find = await Schema.findOne({ guild_id: interaction.guild.id });
      if (!find) {
        const embed1 = new Embed(client, 'error')
          .setTitle('❌ 에러 발생')
          .setDescription(
            `뮤직 시스템이 설치되어 있지 않습니다. 뮤직 시스템을 설치하려면 \`/뮤직\`를 사용해주세요.`,
          )
        return interaction.reply({ embeds: [embed1] });
      }
      const musicchannel = client.channels.cache.get(find.channel_id)
      if (!musicchannel) {
        await Schema.deleteOne({ guild_id: interaction.guild.id });
        const embed2 = new Embed(client, 'default')
          .setTitle('✅ 성공')
          .setDescription(`뮤직 시스템이 해제되었습니다.\n 다시 설치하려면 \`/뮤직\`를 사용해주세요.`)
        return interaction.reply({ embeds: [embed2] });
      }
      await musicchannel.delete()
      await Schema.deleteOne({ guild_id: interaction.guild.id });
      const embed2 = new Embed(client, 'default')
        .setTitle('✅ 성공')
        .setDescription(`뮤직 시스템이 해제되었습니다.\n 다시 설치하려면 \`/뮤직\`를 사용해주세요.`)
      return interaction.reply({ embeds: [embed2] });
    },
  },
);
