import { BaseCommand } from '../../structures/Command'
import Discord from 'discord.js'
import Embed from '../../utils/Embed'
import comma from 'comma-number'
import Schema from '../../schemas/돈'

export default new BaseCommand(
  {
    name: '돈순위',
    description: '자신의 돈을 확인합니다.',
    aliases: ['순위', 'moneylist', 'tnsdnl']
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'warn').setTitle('처리중..')

    let m = await message.reply({
      embeds: [embed]
    })
    Schema.find()
      .sort({ "money": 1, "descending": 1 })
      .limit(30)
      .exec((error, res) => {
        for (let i = 0; i < res.length; i++) {
          let searchuser = client.users.cache.get(res[i].userid)
          const user = searchuser
          const users = user?.username ?? "찾을수가 없어요!";
          embed = new Embed(client, 'info').setTitle('돈 순위표').addField(`${i + 1}. ${users}`, `${comma(res[i].money)}원`, true)
        }
        m.edit({
          embeds: [embed]
        })
      })

  }
)