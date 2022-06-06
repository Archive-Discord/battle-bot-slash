import { BaseCommand } from '../../structures/Command'
import Discord from 'discord.js'
import Embed from '../../utils/Embed'
import comma from 'comma-number'
import schema from '../../schemas/Money'

export default new BaseCommand(
  {
    name: 'givemoney',
    description: '자신의 돈을 확인합니다.',
    aliases: ['돈받기', 'moneyget', 'ehswnj', '돈줘']
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'warn').setTitle('처리중..')
    .setColor('#2f3136')
    let m = await message.reply({
      embeds: [embed]
    })
    const t = new Date()
    const date = "" + t.getFullYear() + t.getMonth() + t.getDate();
    const ehqkrduqn = await schema.findOne({
      userid: message.author.id
    })
    if (!ehqkrduqn) {
      let newData = new schema({
        money: parseInt('5000'),
        userid: message.author.id,
        date: date
      })
      newData.save()
      embed = new Embed(client, 'success').setTitle('환영합니다!')
        .setDescription(`처음이시군요! 5000원을 입금해드리겠습니다!`)
        .setColor('#2f3136')
      m.edit({
        embeds: [embed]
      })
    } else {

      embed = new Embed(client, 'info')
        .setDescription(`이미 오늘 돈을 받으셨어요 ㅠㅠ\n다음에 다시 와주세요!`)
        .setColor('#2f3136')
      if (ehqkrduqn.date == date) return m.edit({
        embeds: [embed]
      })
      const money = parseInt(String(ehqkrduqn.money))
      await schema.findOneAndUpdate({ userid: message.author.id }, {
        money: money + 5000,
        userid: message.author.id,
        date: date
      })
      const f = money + 5000
      embed = new Embed(client, 'success').setTitle('입금이 완료되었습니다!')
        .setDescription(`처음이시군요! 5000원을 입금해드리겠습니다!`)
        .addField(`돈이 입금되었습니다!`, `현재 잔액 : ${comma(f)}`)
        .setColor('#2f3136')
      m.edit({
        embeds: [embed]
      })
    }
  }
)
