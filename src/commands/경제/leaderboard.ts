import { BaseCommand } from '../../structures/Command'
import Discord from 'discord.js'
import Embed from '../../utils/Embed'
import comma from 'comma-number'
import Schema from '../../schemas/Money'

export default new BaseCommand(
  {
    name: 'leaderboard',
    description: '자신의 돈을 확인합니다.',
    aliases: ['순위', 'moneylist', 'tnsdnl', '랭킹', '돈순위']
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'warn').setTitle('처리중..')

    let m = await message.reply({
      embeds: [embed]
    })
    Schema.find()
      .sort({ money: 1, descending: 1 })
      .limit(10)
      .exec((error, res) => {
        const embed = new Embed(client, 'info').setTitle('돈 순위표')
        for (let i = 0; i < res.length; i++) {
          let searchuser = client.users.cache.get(res[i].userid)
          const user = searchuser
          const users = user?.username ?? '찾을수가 없어요!'
          embed.addField(`${i + 1}. ${users}`, `${comma(res[i].money)}원`)
          embed.setColor('#2f3136')
        }
        m.edit({
          embeds: [embed]
        })
      })
  }
)
