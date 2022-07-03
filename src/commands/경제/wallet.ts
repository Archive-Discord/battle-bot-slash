import { BaseCommand } from '../../structures/Command'
import Discord from 'discord.js'
import Embed from '../../utils/Embed'
import comma from 'comma-number'
import Schema from '../../schemas/Money'

export default new BaseCommand(
  {
    name: 'wallet',
    description: '자신의 돈을 확인합니다.',
    aliases: ['잔액', 'money', 'ehs', 'wlrkq', '지갑', '돈']
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'warn')
      .setTitle('처리중..')
      .setColor('#2f3136')
    let m = await message.reply({
      embeds: [embed]
    })
    const user = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author
    const wjdqh = await Schema.findOne({ userid: user.id })

    embed = new Embed(client, 'success').setTitle(`정보 오류`)
      .setDescription(`아쉽지만 ${message.author}님의 정보가 기록되어있지 않아요..ㅠ\n!돈받기 명령어로 정보를 알려주세요!`)

    if (!wjdqh) return m.edit({
      embeds: [embed]
    })
    const t = new Date()
    const date = "" + t.getFullYear() + t.getMonth() + t.getDate();
    let i
    if (wjdqh.date == date) i = "돈을 받음"
    else i = "돈을 받지않음"
    embed = new Embed(client, 'success')
      .setTitle(`${user.tag}님의 잔액`)
      .setDescription(`유저님의 잔액은 아래와 같습니다.`)
      .addField("잔액 :", `**${comma(wjdqh.money)}원**`)
      .setColor('#2f3136')
    m.edit({
      embeds: [embed]
    })
  }
)
