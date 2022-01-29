const { Message } = require('discord.js') // eslint-disable-line no-unused-vars
const config = require('../../config')
const { LoggerSetting } = require('../schemas/LogSettingSchema')
const LogEmbed = require('../utils/LogEmbed')

module.exports = {
  name: 'messageDelete',
  /**
   * 
   * @param {import('../structures/BotClient')} client 
   * @param {Message} message
   */
  async execute(client, message) {
    if(message.content.startsWith(config.bot.prefix)) return
    if (message.author.id == client.user.id) return
    if (message.channel.type == 'DM') return
    if (!message.content && message.attachments.size == 0 && message.embeds[0]) return
    let LoggerSettingDB = await LoggerSetting.findOne({guild_id: message.guild.id})
    if(!LoggerSettingDB) return
    if(!LoggerSettingDB.useing.deleteMessage) return
    let logChannel = message.guild.channels.cache.get(LoggerSettingDB.guild_channel_id)
    if(!logChannel) return
    if (message.content.length > 1024) {
      message.content = message.content.slice(0, 700) + '...'
    }
    let embed = new LogEmbed(client, 'error')
      .setDescription('메시지 삭제')
    embed.addField('채널', `<#${message.channel.id}>` + '(`' + message.channel.id + '`)')
    embed.addField('작성자', `<@${message.author.id}>` + '(`' + message.author.id + '`)')
    if (message.content.length > 0) embed.addField('내용', `${message.content}`)
    if (message.attachments.size > 0) {
      embed.fields.push({
        'name': '파일',
        'value': message.attachments.map(file => `[링크](${file.url})`).join('\n'),
      })
    }

    return await logChannel.send({embeds: [embed]})
  }
}
