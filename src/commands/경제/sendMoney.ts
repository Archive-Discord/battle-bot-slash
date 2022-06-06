import { BaseCommand } from '../../structures/Command'
import Discord from 'discord.js'
import Embed from '../../utils/Embed'
import comma from 'comma-number'
import Schema from '../../schemas/Money'

export default new BaseCommand(
  {
    name: 'sendMoney',
    description: '자신의 돈을 확인합니다.',
    aliases: ['송금', 'moneysay', 'thdrma']
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'warn').setTitle('처리중..')
    let m = await message.reply({
      embeds: [embed]
    })
    const user = message.mentions.users.first()
    embed = new Embed(client, 'error').setDescription(
      `송금할 대상을 선택해주세요!`
    )
    if (!user)
      return m.edit({
        embeds: [embed]
      })
    const sk = await Schema.findOne({ userid: message.author.id })
    const tkdeoqkd = await Schema.findOne({ userid: user.id })
    embed = new Embed(client, 'error')
      .setDescription(
        message.author +
          '님의 정보가 확인되지 않습니다.\n먼저 `!돈받기`를 입력해 정보를 알려주세요!'
      )
      .setTimestamp()
    if (!sk)
      return m.edit({
        embeds: [embed]
      })
    embed = new Embed(client, 'error')
      .setDescription(
        '상대방의 정보가 확인되지 않았어요ㅠㅠ\n상대방에게 먼저 `!돈받기`를 입력해 정보를 알려달라고 해주세요!'
      )
      .setTimestamp()
    if (!tkdeoqkd)
      return m.edit({
        embeds: [embed]
      })
    const betting = parseInt(args[1])
    embed = new Embed(client, 'error')
      .setDescription('사용법 : !송금 @멘션 (금액)')
      .setTimestamp()
    if (!betting)
      return m.edit({
        embeds: [embed]
      })

    embed = new Embed(client, 'error')
      .setDescription(
        '금액정보가 올바르지 않아요!\n특수문자가 들어가있다면 제거해주세요!(-)'
      )
      .setTimestamp()
    if (message.content.includes('-'))
      return m.edit({
        embeds: [embed]
      })
    embed = new Embed(client, 'error')
      .setDescription('송금할수 있는 최소 금액은 1000원부터 시작합니다!')
      .setTimestamp()
    if (betting < 1000)
      return m.edit({
        embeds: [embed]
      })
    const money = parseInt(String(sk.money))
    const money2 = parseInt(String(tkdeoqkd.money))
    embed = new Embed(client, 'error')
      .setDescription('보유하고 있는 돈보다 많은 금액은 보낼수가 없어요.')
      .setTimestamp()
    if (money < betting)
      return m.edit({
        embeds: [embed]
      })
    embed = new Embed(client, 'error')
      .setDescription('잠시만요 지금 누구한테 보내려는거죠?')
      .setTimestamp()
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
      .setTitle('돈을 보냈어요!')
      .addField(`송금인 잔액`, `${comma(money - betting)}원`, true)
      .addField(`받는사람 잔액`, ` ${money2 + betting}원`, true)
      .setTimestamp()
      .setColor('#2f3136')
    m.edit({
      embeds: [embed]
    })
  }
)
