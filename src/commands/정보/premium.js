const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
const Embed = require('../../utils/Embed')
const { Premium } = require('../../schemas/premiumSchemas')
const config = require('../../../config')

module.exports = {
  name: '프리미엄',
  description: '서버의 프리미엄 만료일을 보여줍니다',
  aliases: ['premium'],
  isSlash: false,
  /**
   * @param {import('../../structures/BotClient')} client 
   * @param {Discord.Message} message 
   * @param {string[]} args 
   */
  async execute(client, message, args) {
    let embed = new Embed(client, 'success')
      .setTitle(`${client.user.username} 프리미엄`)
    let premium = await Premium.findOne({guild_id: message.guild.id})
    if(!premium) {
        embed.setDescription(`이 서버는 프리미엄을 사용한 기록이 없습니다 [여기](${config.web.baseurl}/premium) 에서 프리미엄을 구매해주세요`)
        return message.reply({embeds: [embed]})
    } else {
        let nextpay_date = new Date(premium.nextpay_date)
        let now = new Date()
        if(now > nextpay_date) {
            embed.setDescription(`이 서버는 프리미엄이 ${nextpay_date.getFullYear() + '년 ' + (nextpay_date.getMonth() + 1) + '월 ' + nextpay_date.getDate() + '일'}에 만료 되었습니다 [여기](${config.web.baseurl}/premium) 에서 프리미엄을 구매해주세요`)
            return message.reply({embeds: [embed]})
        } else {
            embed.setDescription(`이 서버의 프리미엄 만료일은 ${nextpay_date.getFullYear() + '년 ' + (nextpay_date.getMonth() + 1) + '월 ' + nextpay_date.getDate() + '일'} 입니다`)
            return message.reply({embeds: [embed]})
        }
    }


  },
  slash: {
    name: 'premium',
    data: new SlashCommandBuilder()
      .setName('premium')
      .setDescription('서버의 프리미엄 만료일을 보여줍니다')
      .toJSON(),
    /**
     * 
     * @param {import('../../structures/BotClient')} client 
     * @param {Discord.CommandInteraction} interaction 
     */
    async execute(client, interaction) {
        await interaction.deferReply();
        let embed = new Embed(client, 'success')
        .setTitle(`${client.user.username} 프리미엄`)
        let premium = await Premium.findOne({guild_id: interaction.guild.id})
        if(!premium) {
            embed.setDescription(`이 서버는 프리미엄을 사용한 기록이 없습니다 [여기](${config.web.baseurl}/premium) 에서 프리미엄을 구매해주세요`)
            return interaction.editReply({embeds: [embed]})
        } else {
            let nextpay_date = new Date(premium.nextpay_date)
            let now = new Date()
            if(now > nextpay_date) {
                embed.setDescription(`이 서버는 프리미엄이 ${nextpay_date.getFullYear() + '년 ' + (nextpay_date.getMonth() + 1) + '월 ' + nextpay_date.getDate() + '일'}에 만료 되었습니다 [여기](${config.web.baseurl}/premium) 에서 프리미엄을 구매해주세요`)
                return interaction.editReply({embeds: [embed]})
            } else {
                embed.setDescription(`이 서버의 프리미엄 만료일은 ${nextpay_date.getFullYear() + '년 ' + (nextpay_date.getMonth() + 1) + '월 ' + nextpay_date.getDate() + '일'} 입니다`)
                return interaction.editReply({embeds: [embed]})
            }
        }
    }
  }
}