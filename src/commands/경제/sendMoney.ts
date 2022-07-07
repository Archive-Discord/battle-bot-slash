import { BaseCommand } from '../../structures/Command'
import Discord from 'discord.js'
import Embed from '../../utils/Embed'
import comma from 'comma-number'
import Schema from '../../schemas/Money'
import { SlashCommandBuilder, userMention } from '@discordjs/builders'

export default new BaseCommand(
  {
    name: 'sendMoney',
    description: '자신의 돈을 확인합니다.',
    aliases: ['송금', 'moneysay', 'thdrma']
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'warn')
      .setTitle('생각하는 중...')
    let m = await message.reply({
      embeds: [embed]
    })
    const user = message.mentions.users.first()
    embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription(`송금할 대상이 지정되지 않았습니다.`)
      .setColor('#2f3136')
    if (!user)
      return m.edit({
        embeds: [embed]
      })
    const sk = await Schema.findOne({ userid: message.author.id })
    const tkdeoqkd = await Schema.findOne({ userid: user.id })
    embed = new Embed(client, 'error')
      .setDescription(
        message.author +
        '님의 계좌가 생성되지 않으셨습니다.\n먼저 `!돈받기`를 입력한 유저에게만 송금이 가능합니다!'
      )
      .setTimestamp()
      .setColor('#2f3136')
    if (!sk)
      return m.edit({
        embeds: [embed]
      })
    embed = new Embed(client, 'error')
      .setDescription(
        '계좌가 생성되지 않으셨습니다. \n먼저 `!돈받기`를 입력한 유저에게만 송금이 가능합니다!'
      )
      .setTimestamp()
      .setColor('#2f3136')
    if (!tkdeoqkd)
      return m.edit({
        embeds: [embed]
      })
    const betting = parseInt(args[1])
    embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription('사용법 : !송금 @멘션 (금액)')
      .setTimestamp()
      .setColor('#2f3136')
    if (!betting)
      return m.edit({
        embeds: [embed]
      })

    embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription(
        '금액정보가 올바르지 않아요!\n특수문자가 들어가있다면 제거해주세요!(-)'
      )
      .setTimestamp()
      .setColor('#2f3136')
    if (message.content.includes('-'))
      return m.edit({
        embeds: [embed]
      })
    embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription('송금할수 있는 최소 금액은 1000원부터 시작합니다!')
      .setTimestamp()
      .setColor('#2f3136')
    if (betting < 1000)
      return m.edit({
        embeds: [embed]
      })
    const money = parseInt(String(sk.money))
    const money2 = parseInt(String(tkdeoqkd.money))
    embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription('보유하고 있는 돈보다 많은 금액은 보낼수가 없어요.')
      .setTimestamp()
      .setColor('#2f3136')
    if (money < betting)
      return m.edit({
        embeds: [embed]
      })
    embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription('돈을 본인에게 보내실 수 없습니다.')
      .setTimestamp()
      .setColor('#2f3136')
    if (message.author.id == user.id)
      return m.edit({
        embeds: [embed]
      })
    await Schema.findOneAndUpdate(
      { userid: message.author.id },
      {
        money: money - betting,
        userid: message.author.id,
        date: sk.date
      }
    )
    await Schema.findOneAndUpdate(
      { userid: user.id },
      {
        money: money2 + betting,
        userid: user.id,
        date: tkdeoqkd.date
      }
    )
    embed = new Embed(client, 'info')
      .setTitle('⭕ 송금 완료')
      .addField(`송금인 잔액`, `${comma(money - betting)}원`, true)
      .addField(`받는사람 잔액`, ` ${money2 + betting}원`, true)
      .setTimestamp()
      .setColor('#2f3136')
    m.edit({
      embeds: [embed]
    })
  },
  {
    // @ts-ignore
    data: new SlashCommandBuilder()
      .setName('송금')
      .setDescription('자신의 돈을 다른사람에게 송금합니다.')
      .addUserOption(options => options
        .setName("유저")
        .setDescription("송금하실 유저를 선택해주세요.")
        .setRequired(true))
      .addIntegerOption(options => options
        .setName("송금액")
        .setDescription("지정한 대상에게 송금하실 포인트를 작성해주세요. ( 최소 1000 포인트 )")
        .setRequired(true)),
    options: {
      name: '돈',
      isSlash: true
    },
    async execute(client, interaction) {
      await interaction.deferReply({})
      let embed = new Embed(client, 'warn')
        .setTitle('처리중..')
        .setColor('#2f3136')
      let m = await interaction.editReply({
        embeds: [embed]
      })
      let user = interaction.options.getMember("유저") || interaction.member
      let user2 = interaction.options.getUser("유저") || interaction.user
      let betting = interaction.options.getInteger("송금액") || 0
      embed = new Embed(client, 'error')
        .setTitle(`❌ 에러 발생`)
        .setDescription(`송금할 대상이 지정되지 않았습니다.`)
        .setColor('#2f3136')
      if (!user)
        return interaction.editReply({
          embeds: [embed]
        })
      const sk = await Schema.findOne({ userid: interaction.user.id })
      const tkdeoqkd = await Schema.findOne({ userid: user2.id })
      embed = new Embed(client, 'error')
        .setDescription(
          interaction.user +
          '님의 계좌가 생성되지 않으셨습니다.\n먼저 `!돈받기`를 입력한 유저에게만 송금이 가능합니다!'
        )
        .setTimestamp()
        .setColor('#2f3136')
      if (!sk)
        return interaction.editReply({
          embeds: [embed]
        })
      embed = new Embed(client, 'error')
        .setDescription(
          '계좌가 생성되지 않으셨습니다. \n먼저 `!돈받기`를 입력한 유저에게만 송금이 가능합니다!'
        )
        .setTimestamp()
        .setColor('#2f3136')
      if (!tkdeoqkd)
        return interaction.editReply({
          embeds: [embed]
        })
      embed = new Embed(client, 'error')
        .setTitle(`❌ 에러 발생`)
        .setDescription('송금할수 있는 최소 금액은 1000원부터 시작합니다!')
        .setTimestamp()
        .setColor('#2f3136')
      if (betting < 1000)
        return interaction.editReply({
          embeds: [embed]
        })
      const money = parseInt(String(sk.money))
      const money2 = parseInt(String(tkdeoqkd.money))
      embed = new Embed(client, 'error')
        .setTitle(`❌ 에러 발생`)
        .setDescription('보유하고 있는 돈보다 많은 금액은 보낼수가 없어요.')
        .setTimestamp()
        .setColor('#2f3136')
      if (money < betting)
        return interaction.editReply({
          embeds: [embed]
        })
      embed = new Embed(client, 'error')
        .setTitle(`❌ 에러 발생`)
        .setDescription('돈을 본인에게 보내실 수 없습니다.')
        .setTimestamp()
        .setColor('#2f3136')
      if (interaction.user.id == user2.id)
        return interaction.editReply({
          embeds: [embed]
        })
      await Schema.findOneAndUpdate(
        { userid: interaction.user.id },
        {
          money: money - betting,
          userid: interaction.user.id,
          date: sk.date
        }
      )
      await Schema.findOneAndUpdate(
        { userid: user2.id },
        {
          money: money2 + betting,
          userid: user2.id,
          date: tkdeoqkd.date
        }
      )
      embed = new Embed(client, 'info')
        .setTitle('⭕ 송금 완료')
        .addField(`송금인 잔액`, `${comma(money - betting)}원`, true)
        .addField(`받는사람 잔액`, ` ${money2 + betting}원`, true)
        .setTimestamp()
        .setColor('#2f3136')
        interaction.editReply({
        embeds: [embed]
      })
    }
  }
)