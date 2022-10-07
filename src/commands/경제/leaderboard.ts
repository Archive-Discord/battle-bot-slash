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
    const type = args[0];
    const data = await Schema.find().sort({ money: -1, descending: -1 }).limit(10);
    const embed = new Embed(client, 'info').setColor('#2f3136');
    for (let i = 0; i < data.length; i++) {
      if (type === '전체') {
        embed.setTitle(client.i18n.t('commands.leaderboard.title.rank'));
        let searchuser = client.users.cache.get(data[i].userid);
        if (!searchuser) return;
        embed.addFields({
          name: client.i18n.t('commands.leaderboard.fields.name', {
            num: i + 1,
            username: searchuser.username,
          }),
          value: client.i18n.t('commands.leaderboard.fields.value', {
            money: comma(data[i].money),
          }),
        });
        embed.setColor('#2f3136');
      } else if (type === '서버') {
        embed.setTitle(client.i18n.t('commands.leaderboard.title.srank'));
        let searchuser = message.guild?.members.cache.get(data[i].userid);
        if (!searchuser) return;
        embed.addFields({
          name: client.i18n.t('commands.leaderboard.fields.nameserver', {
            num: i + 1,
            username: searchuser.nickname ?? searchuser.user.username,
          }),
          value: client.i18n.t('commands.leaderboard.fields.value', {
            money: comma(data[i].money),
          }),
        });
        embed.setColor('#2f3136');
      } else {
        embed.setTitle(client.i18n.t('commands.leaderboard.title.rank'));
        let searchuser = client.users.cache.get(data[i].userid);
        if (!searchuser) return;
        embed.addFields({
          name: client.i18n.t('commands.leaderboard.fields.name', {
            num: i + 1,
            username: searchuser.username,
          }),
          value: client.i18n.t('commands.leaderboard.fields.value', {
            money: comma(data[i].money),
          }),
        });
        embed.setColor('#2f3136');
      }
    }
    message.reply({
      embeds: [embed],
    });
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
      const type = interaction.options.getString('옵션') || '전체';
      const data = await Schema.find().sort({ money: -1, descending: -1 }).limit(10);
      const embed = new Embed(client, 'info').setColor('#2f3136');
      for (let i = 0; i < data.length; i++) {
        if (type === '전체') {
          embed.setTitle(client.i18n.t('commands.leaderboard.title.rank'));
          let searchuser = client.users.cache.get(data[i].userid);
          if (!searchuser) return;
          embed.addFields({
            name: client.i18n.t('commands.leaderboard.fields.name', {
              num: i + 1,
              username: searchuser.username,
            }),
            value: client.i18n.t('commands.leaderboard.fields.value', {
              money: comma(data[i].money),
            }),
          });
          embed.setColor('#2f3136');
        } else if (type === '서버') {
          embed.setTitle(client.i18n.t('commands.leaderboard.title.srank'));
          let searchuser = interaction.guild?.members.cache.get(data[i].userid);
          if (!searchuser) return;
          embed.addFields({
            name: client.i18n.t('commands.leaderboard.fields.nameserver', {
              num: i + 1,
              username: searchuser.nickname ?? searchuser.user.username,
            }),
            value: client.i18n.t('commands.leaderboard.fields.value', {
              money: comma(data[i].money),
            }),
          });
          embed.setColor('#2f3136');
        } else {
          embed.setTitle(client.i18n.t('commands.leaderboard.title.rank'));
          let searchuser = client.users.cache.get(data[i].userid);
          if (!searchuser) return;
          embed.addFields({
            name: client.i18n.t('commands.leaderboard.fields.name', {
              num: i + 1,
              username: searchuser.username,
            }),
            value: client.i18n.t('commands.leaderboard.fields.value', {
              money: comma(data[i].money),
            }),
          });
          embed.setColor('#2f3136');
        }
      }
      interaction.editReply({
        embeds: [embed],
      });
    },
  },
);
