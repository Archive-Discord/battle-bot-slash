import { BaseCommand } from '../../structures/Command';
import Discord from 'discord.js';
import Embed from '../../utils/Embed';
import comma from 'comma-number';
import Schema from '../../schemas/Money';
import { SlashCommandBuilder, userMention } from '@discordjs/builders';

export default new BaseCommand(
  {
    name: 'sendMoney',
    description: '자신의 돈을 확인합니다.',
    aliases: ['송금', 'moneysay', 'thdrma'],
  },
  async (client, message, args) => {
    const user = message.mentions.users.first();
    const sk = await Schema.findOne({ userid: message.author.id });
    if (!user) {
      let embed = new Embed(client, 'error')
        .setTitle(`❌ 에러 발생`)
        .setDescription(`송금할 대상이 지정되지 않았습니다.`)
      return message.reply({ embeds: [embed] });
    }
    const tkdeoqkd = await Schema.findOne({ userid: user.id });
    if (!sk) {
      let embed = new Embed(client, 'error')
        .setTitle(`❌ 에러 발생`)
        .setDescription(message.author.toString() + '님의 계좌가 생성되지 않으셨습니다. \n계좌가 있으신 유저에게만 송금이 가능합니다.')
        .setTimestamp()
      return message.reply({ embeds: [embed] });
    }
    else if (!tkdeoqkd) {
      let embed = new Embed(client, 'error')
        .setTitle(`❌ 에러 발생`)
        .setDescription('계좌가 생성되지 않으셨습니다. \n계좌가 있으신 유저에게만 송금이 가능합니다.')
        .setTimestamp()
      return message.reply({ embeds: [embed] });
    }
    const betting = parseInt(args[1]);
    const money = parseInt(String(sk.money));
    const money2 = parseInt(String(tkdeoqkd.money));
    if (!betting) {
      let embed = new Embed(client, 'error')
        .setTitle(`❌ 에러 발생`)
        .setDescription('사용법 : !송금 @멘션 (금액)')
        .setTimestamp()
      return message.reply({ embeds: [embed] });
    }
    else if (message.content.includes('-')) {
      let embed = new Embed(client, 'error')
        .setTitle(`❌ 에러 발생`)
        .setDescription('금액은 자연수만 입력해주세요.')
        .setTimestamp()
      return message.reply({ embeds: [embed] });
    }
    else if (betting < 1000) {
      let embed = new Embed(client, 'error')
        .setTitle(`❌ 에러 발생`)
        .setDescription('최소 배팅 금액은 1,000원 입니다. 1,000원 이상으로 입력해주세요.')
        .setTimestamp()
      return message.reply({ embeds: [embed] });
    }
    else if (money < betting) {
      let embed = new Embed(client, 'error')
        .setTitle(`❌ 에러 발생`)
        .setDescription('보내실려는 금액이 보유하신 금액보다 큽니다.')
        .setTimestamp()
      return message.reply({ embeds: [embed] });
    }
    else if (message.author.id == user.id) {
      let embed = new Embed(client, 'error')
        .setTitle(`❌ 에러 발생`)
        .setDescription('돈을 본인에게 보내실 수 없습니다.')
        .setTimestamp()
      return message.reply({ embeds: [embed], });
    }
    await Schema.findOneAndUpdate(
      { userid: message.author.id },
      {
        lastGuild: message.guild ? message.guild.id : sk.lastGuild,
        money: money - betting,
        userid: message.author.id,
        date: sk.date,
      },
    );
    await Schema.findOneAndUpdate(
      { userid: user.id },
      {
        lastGuild: tkdeoqkd.lastGuild,
        money: money2 + betting,
        userid: user.id,
        date: tkdeoqkd.date,
      },
    );
    let embed = new Embed(client, 'default')
      .setTitle('⭕ 송금 완료')
      .addFields(
        {
          name: `송금인 잔액`,
          value: `${comma(money - betting)}원`,
          inline: true
        },
        {
          name: `받는사람 잔액`,
          value: ` ${money2 + betting}원`,
          inline: true
        },
      )
      .setTimestamp()
    message.reply({ embeds: [embed] });
  },
  {
    // @ts-ignore
    data: new SlashCommandBuilder()
      .setName('송금')
      .setDescription('자신의 돈을 다른사람에게 송금합니다.')
      .addUserOption((options) =>
        options.setName('유저').setDescription('송금하실 유저를 선택해주세요.').setRequired(true),
      )
      .addIntegerOption((options) =>
        options
          .setName('송금액')
          .setDescription('지정한 대상에게 송금하실 포인트를 작성해주세요. ( 최소 1000 포인트 )')
          .setRequired(true),
      ),
    options: {
      name: '돈',
      isSlash: true,
    },
    async execute(client, interaction) {
      await interaction.deferReply({ ephemeral: true });
      let user = interaction.options.getMember('유저') || interaction.member;
      let user2 = interaction.options.getUser('유저') || interaction.user;
      let betting = interaction.options.getInteger('송금액') || 0;
      if (!user) {
        let embed = new Embed(client, 'error')
          .setTitle(`❌ 에러 발생`)
          .setDescription(`송금할 대상이 지정되지 않았습니다.`)
        return interaction.editReply({ embeds: [embed] });
      }
      const sk = await Schema.findOne({ userid: interaction.user.id });
      const tkdeoqkd = await Schema.findOne({ userid: user2.id });
      if (!sk) {
        let embed = new Embed(client, 'error')
          .setTitle(`❌ 에러 발생`)
          .setDescription(interaction.user.toString() + '님의 계좌가 생성되지 않으셨습니다.\n계좌가 있으신 유저에게만 송금이 가능합니다.')
          .setTimestamp()
        return interaction.editReply({ embeds: [embed] });
      }
      else if (!tkdeoqkd) {
        let embed = new Embed(client, 'error')
          .setTitle(`❌ 에러 발생`)
          .setDescription('계좌가 생성되지 않으셨습니다. \n계좌가 있으신 유저에게만 송금이 가능합니다.',)
          .setTimestamp()
        return interaction.editReply({ embeds: [embed] });
      }
      const money = parseInt(String(sk.money));
      const money2 = parseInt(String(tkdeoqkd.money));
      if (betting < 1000) {
        let embed = new Embed(client, 'error')
          .setTitle(`❌ 에러 발생`)
          .setDescription('1000원 이상부터 송금이 가능합니다.')
          .setTimestamp()
        return interaction.editReply({ embeds: [embed] });
      }
      else if (money < betting) {
        let embed = new Embed(client, 'error')
          .setTitle(`❌ 에러 발생`)
          .setDescription('보내실려는 금액이 보유하신 금액보다 큽니다.')
          .setTimestamp()
        return interaction.editReply({ embeds: [embed] });
      }
      else if (interaction.user.id == user2.id) {
        let embed = new Embed(client, 'error')
          .setTitle(`❌ 에러 발생`)
          .setDescription('돈을 본인에게 보내실 수 없습니다.')
          .setTimestamp()
        return interaction.editReply({ embeds: [embed] });
      }
      await Schema.findOneAndUpdate(
        { userid: interaction.user.id },
        {
          lastGuild: interaction.guild ? interaction.guild.id : sk.lastGuild,
          money: money - betting,
          userid: interaction.user.id,
          date: sk.date,
        },
      );
      await Schema.findOneAndUpdate(
        { userid: user2.id },
        {
          lastGuild: tkdeoqkd.lastGuild,
          money: money2 + betting,
          userid: user2.id,
          date: tkdeoqkd.date,
        },
      );
      let embed = new Embed(client, 'default')
        .setTitle('⭕ 송금 완료')
        .addFields(
          {
            name: `송금인 잔액`,
            value: `${comma(money - betting)}원`,
            inline: true,
          },
          {
            name: `받는사람 잔액`,
            value: `${money2 + betting}원`,
            inline: true,
          },
        )
        .setTimestamp()
      interaction.editReply({ embeds: [embed] });
    },
  },
);
