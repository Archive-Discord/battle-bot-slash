const { MessageReaction, User } = require('discord.js') // eslint-disable-line no-unused-vars
const { LoggerSetting } = require('../schemas/LogSettingSchema')
const Embed = require('../utils/LogEmbed')

module.exports = {
  name: 'messageReactionRemove',
  /**
   * @param {import('../structures/BotClient')} client 
   * @param {MessageReaction} messageReaction
   * @param {User} user
   */
  async execute(client, messageReaction, user) {
    const { guild } = messageReaction.message
    if(user.bot) return
    if(!guild) return
    let LoggerSettingDB = await LoggerSetting.findOne({guild_id: messageReaction.message.guild.id})
    if(!LoggerSettingDB) return
    if(!LoggerSettingDB.useing.reactMessage) return
    let logChannel = messageReaction.message.guild.channels.cache.get(LoggerSettingDB.guild_channel_id)
    if(!logChannel) return
    let embed = new Embed(client, 'error')
      .setTitle('반응 삭제')
    embed.addField('채널', `<#${messageReaction.message.channel.id}>` + '(`' + messageReaction.message.channel.id + '`)')
    embed.addField('메시지', `[메시지](${messageReaction.message.url})`)
    embed.addField('유저', `<@${user.id}>` + '(`' + user.id + '`)')
    embed.addField('반응 이모지', messageReaction.emoji.toString())
    return await logChannel.send({embeds: [embed]})
  }
}