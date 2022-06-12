import { BaseCommand } from '../../structures/Command'
import Discord from 'discord.js'
import Embed from '../../utils/Embed'
import comma from 'comma-number'
import Schema from '../../schemas/Money'

export default new BaseCommand(
  {
    name: 'leaderboard',
    description: '자신의 돈을 확인합니다. (서버, 전체)',
    aliases: ['순위', 'moneylist', 'tnsdnl', '랭킹', '돈순위']
  },
  async (client, message, args) => {
    const type = args[0]
    const data = await Schema.find()
      .sort({ money: -1, descending: -1 })
      .limit(10)
    console.log(data)
    const embed = new Embed(client, 'info').setColor('#2f3136')
    for (let i = 0; i < data.length; i++) {
      if (type === '전체') {
        embed.setTitle('돈 순위표')
        let searchuser = client.users.cache.get(data[i].userid)
        if (!searchuser) return
        embed.addField(
          `${i + 1}. ${searchuser.username}`,
          `${comma(data[i].money)}원`
        )
      } else if (type === '서버') {
        embed.setTitle('서버 돈 순위표')
        let searchuser = message.guild?.members.cache.get(data[i].userid)
        if (!searchuser) return
        embed.addField(
          `${i + 1}. ${searchuser.nickname ?? searchuser.user.username}`,
          `${comma(data[i].money)}원`
        )
      } else {
        embed.setTitle('돈 순위표')
        let searchuser = client.users.cache.get(data[i].userid)
        if (!searchuser) return
        embed.addField(
          `${i + 1}. ${searchuser.username}`,
          `${comma(data[i].money)}원`
        )
      }
    }
    message.reply({
      embeds: [embed]
    })
  }
)
