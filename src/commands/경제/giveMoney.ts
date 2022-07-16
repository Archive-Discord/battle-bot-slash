import { BaseCommand } from '../../structures/Command'
import Discord from 'discord.js'
import Embed from '../../utils/Embed'
import comma from 'comma-number'
import schema from '../../schemas/Money'
import { SlashCommandBuilder, userMention } from '@discordjs/builders'

export default new BaseCommand(
  {
    name: 'givemoney',
    description: '자신의 돈을 확인합니다.',
    aliases: ['돈받기', 'moneyget', 'ehswnj', '돈줘']
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'warn')
      .setTitle('생각하는 중...')
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
      embed = new Embed(client, 'success')
        .setTitle('⭕ 입금 완료')
        .setDescription(`입금이 정상적으로 완료되었습니다. + **5000원**`)
        .setColor('#2f3136')
      m.edit({
        embeds: [embed]
      })
    } else {
      embed = new Embed(client, 'info')
        .setTitle(`❌ 입금 실패`)
        .setDescription(`오늘은 이미 5000원을 받으셨습니다.`)
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
      embed = new Embed(client, 'success')
        .setTitle('⭕ 입금 완료')
        .setDescription(`입금이 정상적으로 완료되었습니다. + **5000원**`)
        .setDescription(`잔액 :  ${comma(money + 5000)}원`)
        .setColor('#2f3136')
      m.edit({
        embeds: [embed]
      })
    }
  },
  {
    // @ts-ignore
    data: new SlashCommandBuilder()
      .setName('돈받기')
      .setDescription('자신의 돈을 받습니다.'),
    async execute(client, interaction) {
      await interaction.deferReply({ ephemeral: true })
      const t = new Date()
      const date = "" + t.getFullYear() + t.getMonth() + t.getDate();
      const ehqkrduqn = await schema.findOne({
        userid: interaction.user.id
      })
      if (!ehqkrduqn) {
        let newData = new schema({
          money: parseInt('5000'),
          userid: interaction.user.id,
          date: date
        })
        newData.save()
        let embed = new Embed(client, 'success')
          .setTitle('⭕ 입금 완료')
          .setDescription(`입금이 정상적으로 완료되었습니다. + **5000원**`)
          .setColor('#2f3136')
          interaction.editReply({
          embeds: [embed]
        })
      } else {
        let embed = new Embed(client, 'info')
          .setTitle(`❌ 입금 실패`)
          .setDescription(`오늘은 이미 5000원을 받으셨습니다.`)
          .setColor('#2f3136')
        if (ehqkrduqn.date == date) return interaction.editReply({
          embeds: [embed]
        })
        const money = parseInt(String(ehqkrduqn.money))
        await schema.findOneAndUpdate({ userid: interaction.user.id }, {
          money: money + 5000,
          userid: interaction.user.id,
          date: date
        })
        embed = new Embed(client, 'success')
          .setTitle('⭕ 입금 완료')
          .setDescription(`입금이 정상적으로 완료되었습니다. + **5000원**`)
          .setDescription(`잔액 :  ${comma(money + 5000)}원`)
          .setColor('#2f3136')
          interaction.editReply({
          embeds: [embed]
        })
      }
    }
  }
)
