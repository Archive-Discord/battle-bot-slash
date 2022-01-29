const { MessageReaction, Message} = require('discord.js') // eslint-disable-line no-unused-vars
const { LoggerSetting } = require('../schemas/LogSettingSchema')
const Embed = require('../utils/LogEmbed')

module.exports = {
  name: 'messageReactionRemoveAll',
  /**
   * @param {import('../structures/BotClient')} client 
   * @param {Message} message
   * @param {MessageReaction} reactions
   */
  async execute(client, message) {
    const { guild } = message
    if(!guild) return
    if(message.partial) await message.fetch()

    let LoggerSettingDB = await LoggerSetting.findOne({guild_id: guild.id})
    if(!LoggerSettingDB) return
    if(!LoggerSettingDB.useing.reactMessage) return

    let logChannel = guild.channels.cache.get(LoggerSettingDB.guild_channel_id)
    if(!logChannel) return

    let embed = new Embed(client, 'error')
      .setTitle('모든 반응 삭제')
      .addField('채널', `<#${message.channel.id}>` + '(`' + message.channel.id + '`)')
      .addField('메시지', `[메시지](${message.url})`)

    
    return await logChannel.send({embeds: [embed]})
  }
}