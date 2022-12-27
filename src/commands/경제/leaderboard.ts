import { BaseCommand } from '../../structures/Command';
import Discord from 'discord.js';
import Embed from '../../utils/Embed';
import comma from 'comma-number';
import Schema from '../../schemas/Money';
import { SlashCommandBuilder, userMention } from '@discordjs/builders';

export default new BaseCommand(
  {
    name: 'leaderboard',
    description: '자신의 돈을 확인합니다. (서버, 전체)',
    aliases: ['순위', 'moneylist', 'tnsdnl', '랭킹', '돈순위'],
  },
  async (client, message, args) => {
    return message.reply('빗금으로 이전되었습니다.');
  },
  {
    // @ts-ignore
    data: new SlashCommandBuilder()
      .setName('돈순위')
      .setDescription('돈 순위를 확인합니다.')
      .addStringOption((options) =>
        options
          .setName('옵션')
          .setDescription('순위 옵션을 선택해주세요.')
          .setRequired(false)
          .addChoices({ name: '서버', value: '서버' }, { name: '전체', value: '전체' }),
      ),
    async execute(client, interaction) {
      await interaction.deferReply({ ephemeral: true });
      if (!interaction.guild) return interaction.editReply({ content: '서버에서만 사용할 수 있습니다.' });
      const type = interaction.options.getString('옵션') || '전체';
      const embed = new Embed(client, 'info').setColor('#2f3136');
      if (type === '전체') {
        const moneyLeaderboard = await Schema.find({}).sort({ money: -1, date: -1 }).limit(10);
        embed.setTitle('돈 순위표');
        let i = 0;
        moneyLeaderboard.forEach((moneyLeader) => {
          console.log(moneyLeader);
          let searchuser = client.users.cache.get(moneyLeader.userid);
          if (!searchuser) return;
          i = i + 1;
          embed.addFields({
            name: `${i}. ${searchuser.username} ${searchuser.id === interaction.user.id ? '(나)' : ''}`,
            value: `> ${comma(moneyLeader.money)}원`,
          });
        })
      } else if (type === '서버') {
        let i = 0;
        embed.setTitle('서버 돈 순위표');
        const moneyLeaderboard = await Schema.find({ lastGuild: interaction.guild.id }).sort({ money: -1, date: -1 }).limit(10);
        moneyLeaderboard.forEach((moneyLeader) => {
          console.log(moneyLeader);
          let searchuser = client.users.cache.get(moneyLeader.userid);
          if (!searchuser) return;
          i = i + 1;
          embed.addFields({
            name: `${i}. ${searchuser.username} ${searchuser.id === interaction.user.id ? '(나)' : ''}`,
            value: `> ${comma(moneyLeader.money)}원`,
          });
        })
      }
      interaction.editReply({
        embeds: [embed],
      });
    },
  },
);
