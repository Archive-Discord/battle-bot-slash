import { BaseCommand } from '../../structures/Command'
import Discord from 'discord.js'
import Embed from '../../utils/Embed'
import { SlashCommandBuilder } from '@discordjs/builders'
import Premium from '../../schemas/premiumSchemas'
import config from '../../../config'

export default new BaseCommand(
  {
    name: 'premium',
    description: '서버의 프리미엄 만료일을 보여줍니다',
    aliases: ['프리미엄', 'vmflaldja']
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'success')
      .setColor('#2f3136')
      .setTitle(`${client.user?.username} 프리미엄`)
    if(!message.guild) {
      embed.setDescription(`프리미엄 확인 기능은 DM 채널에서는 사용이 불가능합니다.`)
      return message.reply({embeds: [embed]})
    }
    let premium = await Premium.findOne({guild_id: message.guild.id})
    if(!premium) {
        embed.setDescription(`이 서버는 프리미엄을 사용한 기록이 없습니다. [여기](${config.web?.baseurl}/premium) 에서 프리미엄을 구매해주세요.`)
        return message.reply({embeds: [embed]})
    } else {
        let nextpay_date = new Date(premium.nextpay_date)
        let now = new Date()
        if(now > nextpay_date) {
            embed.setDescription(`이 서버는 프리미엄이 ${nextpay_date.getFullYear() + '년 ' + (nextpay_date.getMonth() + 1) + '월 ' + nextpay_date.getDate() + '일'}에 만료 되었습니다 [여기](${config.web?.baseurl}/premium) 에서 프리미엄을 구매해주세요.`)
            return message.reply({embeds: [embed]})
        } else {
            embed.setDescription(`이 서버의 프리미엄 만료일은 ${nextpay_date.getFullYear() + '년 ' + (nextpay_date.getMonth() + 1) + '월 ' + nextpay_date.getDate() + '일'} 입니다.`)
            return message.reply({embeds: [embed]})
        }
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName('프리미엄')
      .setDescription('서버의 프리미엄 정보를 확인합니다'),
    options: {
      name: '프리미엄',
      isSlash: true
    },
    async execute(client, interaction) {
      await interaction.deferReply({ ephemeral: true });
      let embed = new Embed(client, 'success')
        .setColor('#2f3136')
        .setTitle(`${client.user?.username} 프리미엄`)
      if(!interaction.guild) {
        embed.setDescription(`프리미엄 확인 기능은 DM 채널에서는 사용이 불가능합니다.`)
        return interaction.editReply({embeds: [embed]})
      }
      let premium = await Premium.findOne({guild_id: interaction.guild.id})
      if(!premium) {
          embed.setDescription(`이 서버는 프리미엄을 사용한 기록이 없습니다. [여기](${config.web?.baseurl}/premium) 에서 프리미엄을 구매해주세요.`)
          return interaction.editReply({embeds: [embed]})
      } else {
          let nextpay_date = new Date(premium.nextpay_date)
          let now = new Date()
          if(now > nextpay_date) {
              embed.setDescription(`이 서버는 프리미엄이 ${nextpay_date.getFullYear() + '년 ' + (nextpay_date.getMonth() + 1) + '월 ' + nextpay_date.getDate() + '일'}에 만료 되었습니다 [여기](${config.web?.baseurl}/premium) 에서 프리미엄을 구매해주세요.`)
              return interaction.editReply({embeds: [embed]})
          } else {
              embed.setDescription(`이 서버의 프리미엄 만료일은 ${nextpay_date.getFullYear() + '년 ' + (nextpay_date.getMonth() + 1) + '월 ' + nextpay_date.getDate() + '일'} 입니다.`)
              return interaction.editReply({embeds: [embed]})
          }
      }
    }
  }
)
