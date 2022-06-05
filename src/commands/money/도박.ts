import { BaseCommand } from '../../structures/Command'
import Discord from 'discord.js'
import Embed from '../../utils/Embed'
import comma from 'comma-number'
import Schema from '../../schemas/돈'

export default new BaseCommand(
  {
    name: '도박',
    description: '자신의 돈을 확인합니다.',
    aliases: []
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'warn').setTitle('처리중..')

    let m = await message.reply({
      embeds: [embed]
    })
    const ehqkrduqn = await Schema.findOne({
      userid: message.author.id
    })
    embed = new Embed(client, 'error').setDescription(message.author + '님의 정보가 확인되지 않습니다.\n먼저 \`!돈줘\`를 입력해 정보를 알려주세요!')
      .setTimestamp()
    if (!ehqkrduqn) return m.edit({
      embeds: [embed]
    })
    embed = new Embed(client, 'error').setDescription('저랑 얼마를 가지고 놀거에요? 알려주세요!')
      .setTimestamp()
    if (!args[0]) return m.edit({
      embeds: [embed]
    })
    embed = new Embed(client, 'error').setDescription('금액정보가 올바르지 않아요!\n특수문자가 들어가있다면 제거해주세요!(-)')
      .setTimestamp()
    if (args.join(" ").includes("-")) return m.edit({
      embeds: [embed]
    })
    const money = parseInt(args[0]);
    embed = new Embed(client, 'error').setDescription('도박할수 있는 최소 금액은 500원부터 시작합니다!')
      .setTimestamp()
    if (money < 500) return m.edit({
      embeds: [embed]
    })
    embed = new Embed(client, 'error').setDescription('보유하고 있는 돈보다 많은 금액은 보낼수가 없어요.')
      .setTimestamp()
    if (money > ehqkrduqn.money) return m.edit({
      embeds: [embed]
    })
    const random = Math.floor(Math.random() * 101)
    if (random < 50) {
      embed = new Embed(client, 'success').setTitle(`아쉽네요..`)
        .setDescription(`저한테 패배 하셨군요... 이 돈은 그럼 제가 쓸어담아보겠습니다!`)
        .addField("잔액 :", `**${comma(money)}원**`)

      m.edit({
        embeds: [embed]
      })
      await Schema.findOneAndUpdate({ userid: message.author.id }, {
        money: ehqkrduqn.money - money,
        userid: message.author.id,
        date: ehqkrduqn.date
      })
    } else {
      embed = new Embed(client, 'success').setTitle(`승리!`)
        .setDescription(`도박에서 저를 이기셨군요!`)
        .addField("잔액 :", `**${comma(money)}원**`)

      m.edit({
        embeds: [embed]
      })
      await Schema.findOneAndUpdate({ userid: message.author.id }, {
        money: ehqkrduqn.money + money,
        userid: message.author.id,
        date: ehqkrduqn.date
      })
    }
  }
)