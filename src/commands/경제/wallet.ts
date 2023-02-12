import { BaseCommand, SlashCommand } from '../../structures/Command';
import Discord from 'discord.js';
import Embed from '../../utils/Embed';
import comma from 'comma-number';
import Schema from '../../schemas/Money';
import { SlashCommandBuilder, userMention } from '@discordjs/builders';
import config from '../../../config';

export default new BaseCommand(
  {
    name: 'wallet',
    description: '자신의 돈을 확인합니다.',
    aliases: ['잔액', 'money', 'ehs', 'wlrkq', '지갑', '돈'],
  },
  async (client, message, args) => {
    const user = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
    const wjdqh = await Schema.findOne({ userid: user.id });
    if (!wjdqh) {
      let embed = new Embed(client, 'error')
        .setTitle(`❌ 에러 발생`)
        .setDescription(`${message.author}님의 정보가 기록되어있지 않습니다. \`${config.bot.prefix}돈받기\`명령어를 이용하여 계좌를 생성해주세요.`);
      return message.reply({ embeds: [embed] });
    }
    await wjdqh.updateOne({ $set: { lastGuild: message.guild ? message.guild.id : wjdqh.lastGuild } })
    let embed = new Embed(client, 'default')
      .setTitle(`${user.tag}님의 잔액`)
      .setDescription(`유저님의 잔액은 아래와 같습니다.`)
      .addFields({ name: '잔액 :', value: `**${comma(wjdqh.money)}원**` })
    message.reply({ embeds: [embed] });
  },
  {
    // @ts-ignore
    data: new SlashCommandBuilder()
      .setName('돈')
      .setDescription('자신의 돈을 확인합니다.')
      .addUserOption((option) =>
        option.setName('유저').setDescription('확인할 유저를 입력해주세요.').setRequired(false),
      ),
    options: {
      name: '돈',
      isSlash: true,
    },
    async execute(client, interaction) {
      await interaction.deferReply({ ephemeral: true });
      let user = interaction.options.getUser('유저') || interaction.user;
      const wjdqh = await Schema.findOne({ userid: user.id });
      if (!wjdqh) {
        let embed = new Embed(client, 'error')
          .setTitle(`❌ 에러 발생`)
          .setDescription(`${interaction.user}님의 정보가 기록되어있지 않습니다. \`/돈받기\`명령어를 이용하여 계좌를 생성해주세요.`);
        return interaction.editReply({ embeds: [embed] });
      }
      await wjdqh.updateOne({ $set: { lastGuild: interaction.guild ? interaction.guild.id : wjdqh.lastGuild } })
      let embed = new Embed(client, 'default')
        .setTitle(`${user.tag}님의 잔액`)
        .setDescription(`유저님의 잔액은 아래와 같습니다.`)
        .addFields({ name: '잔액 :', value: `**${comma(wjdqh.money)}원**` })
      interaction.editReply({ embeds: [embed] });
    },
  },
);
