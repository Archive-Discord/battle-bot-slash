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
    let embed = new Embed(client, 'warn')
      .setTitle(client.i18n.t('main.title.loading'))
      .setColor('#2f3136')
    let m = await message.reply({
      embeds: [embed]
    })
    const t = new Date()
    const date = '' + t.getFullYear() + t.getMonth() + t.getDate()
    const bettingtf = await schema.findOne({
      userid: message.author.id
    })
    if (!bettingtf) {
      let newData = new schema({
        money: parseInt('50000'),
        userid: message.author.id,
        date: date
      })
      newData.save()
      embed = new Embed(client, 'success')
        .setTitle(client.i18n.t('commands.giveMoney.title.welcome'))
        .setDescription(client.i18n.t('commands.giveMoney.description.first'))
        .addFields({
          name: client.i18n.t('commands.giveMoney.fields.name'),
          value: client.i18n.t('commands.giveMoney.fields.value', {
            money: 50000
          })
        })
        .setColor('#2f3136')
      m.edit({
        embeds: [embed]
      })
    } else {
      embed = new Embed(client, 'info')
        .setTitle(client.i18n.t('commands.giveMoney.title.fail'))
        .setDescription(client.i18n.t('commands.giveMoney.description.already'))
        .setColor('#2f3136')
      if (bettingtf.date == date)
        return m.edit({
          embeds: [embed]
        })
      const money = parseInt(String(bettingtf.money))
      await schema.findOneAndUpdate(
        { userid: message.author.id },
        {
          money: money + 10000,
          userid: message.author.id,
          date: date
        }
      )
      const f = money + 10000
      embed = new Embed(client, 'success')
        .setTitle(client.i18n.t('commands.giveMoney.title.success'))
        .addFields({
          name: client.i18n.t('commands.giveMoney.fields.name'),
          value: client.i18n.t('commands.giveMoney.fields.value', {
            money: comma(money + 10000)
          })
        })
        .setColor('#2f3136')
      m.edit({
        embeds: [embed]
      })
    }
  }
)
