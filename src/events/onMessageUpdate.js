const { Message } = require('discord.js') // eslint-disable-line no-unused-vars
const { LoggerSetting } = require('../schemas/LogSettingSchema')
const Embed = require('../utils/LogEmbed')

module.exports = {
  name: 'messageUpdate',
  /**
   * @param {import('../structures/BotClient')} client 
   * @param {Message} oldMessage
   * @param {Message} newMessage
   */
  async execute(client, oldMessage, newMessage) {
    const { guild } = newMessage
    if(!guild) return
    if(oldMessage.partial) await oldMessage.fetch()
    if(oldMessage.partial) await newMessage.fetch()
    if(!oldMessage.content) return
    if(!newMessage.content) return
    let LoggerSettingDB = await LoggerSetting.findOne({guild_id: guild.id})
    if(!LoggerSettingDB) return
    if(!LoggerSettingDB.useing.editMessage) return
    let logChannel = guild.channels.cache.get(LoggerSettingDB.guild_channel_id)
    if(!logChannel) return
    let oldContent = new String(oldMessage.content)
    let newContent = new String(newMessage.content)
    if (oldContent.length > 500) {
      let oldContentLength = oldMessage.content.length - 500
      oldContent = oldMessage.content.slice(0, 500) + `... +${oldContentLength}`
    }
    if (newContent.length > 500) {
      let newContentLength = newMessage.content.length - 500
      newContent = newContent.content.slice(0, 500) + `... +${newContentLength}`
    }
    let embed = new Embed(client, 'warn')
      .setTitle('메시지 수정')
      .addField('채널', `<#${newMessage.channel.id}>` + '(`' + newMessage.channel.id + '`)')
      .addField('메시지', `[메시지](${newMessage.url})`)
      .addField('수정전', `${oldContent ? oldContent : '없음'}`)
      .addField('수정후', `${newContent ? newContent : '없음'}`)

    
    return await logChannel.send({embeds: [embed]})
  }
}