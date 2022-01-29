const { MessageReaction, User } = require('discord.js') // eslint-disable-line no-unused-vars
const { LoggerSetting } = require('../schemas/LogSettingSchema')
const Embed = require('../utils/LogEmbed')

module.exports = {
  name: 'messageReactionAdd',
  /**
   * @param {import('../structures/BotClient')} client 
   * @param {MessageReaction} messageReaction
   * @param {User} user
   */
  async execute(client, messageReaction, user) {
    const { guild } = messageReaction.message
    
    if(user.bot) return
    if(!guild) return
    if(messageReaction.partial) await messageReaction.fetch()
    if(messageReaction.message.partial) await messageReaction.message.fetch()

    let LoggerSettingDB = await LoggerSetting.findOne({guild_id: messageReaction.message.guild.id})
    if(!LoggerSettingDB) return
    if(!LoggerSettingDB.useing.reactMessage) return

    let logChannel = messageReaction.message.guild.channels.cache.get(LoggerSettingDB.guild_channel_id)
    if(!logChannel) return

    let embed = new Embed(client, 'success')
      .setTitle('반응 추가')
      .addField('채널', `<#${messageReaction.message.channel.id}>` + '(`' + messageReaction.message.channel.id + '`)')
      .addField('메시지', `[메시지](${messageReaction.message.url})`)
      .addField('유저', `<@${user.id}>` + '(`' + user.id + '`)')
      .addField('반응 이모지', messageReaction.emoji.toString())

    
    return await logChannel.send({embeds: [embed]})
  }
}